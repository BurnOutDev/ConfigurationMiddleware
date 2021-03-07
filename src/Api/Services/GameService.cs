using CryptoVision.Api.Hubs;
using CryptoVision.Api.Models;
using Microsoft.AspNetCore.SignalR;
using SignalREvents;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using System.Threading.Tasks;
using static Game;
using Api.Hubs;
using CryptoVision.Api.Services;
using System.Diagnostics.CodeAnalysis;
using System.Threading;

namespace CryptoVision.Api.Services
{
    public class GameService
    {
        private int Threshold = 5;
        private int ThresholdTime = 60000;

        #region SortedDictionaries
        public SortedDictionary<long, Guid> TimeMatches { get; set; }
        public SortedDictionary<decimal, Guid> LongPriceMatches { get; set; }
        public SortedDictionary<decimal, Guid> ShortPriceMatches { get; set; }

        #endregion

        public HashSet<BetModel> UnmatchedLongBets { get; set; }
        public HashSet<BetModel> UnmatchedShortBets { get; set; }

        public List<Game> PendingMatched { get; set; }
        public List<Game> Matched { get; set; }

        public List<Game> EndedMatches { get; set; }

        public Dictionary<string, string> EmailConnectionId { get; set; }

        private readonly IHubContext<KlineHub> klineHub;

        public GameService(IHubContext<KlineHub> klinehub)
        {
            UnmatchedShortBets = new HashSet<BetModel>();
            UnmatchedLongBets = new HashSet<BetModel>();
            TimeMatches = new SortedDictionary<long, Guid>();
            LongPriceMatches = new SortedDictionary<decimal, Guid>();
            ShortPriceMatches = new SortedDictionary<decimal, Guid>();
            PendingMatched = new List<Game>();
            Matched = new List<Game>();
            EndedMatches = new List<Game>();
            EmailConnectionId = new Dictionary<string, string>();

            Task.Run(MatchingTimer);

            klineHub = klinehub;
        }

        private void MatchingTimer()
        {
            while (true)
            {
                var mat = new List<Tuple<BetModel, BetModel, Game>>();

                UnmatchedLongBets.OrderBy(x => x.Amount).ToList().ForEach(x =>
                {
                    var sb = UnmatchedShortBets.FirstOrDefault(e => e.Amount == x.Amount);

                    if (sb != null)
                    {
                        var g = new Game
                        {
                            Amount = x.Amount,
                            PlayerWhoBetShort = sb.User,
                            PlayerWhoBetLong = x.User
                        };

                        UnmatchedLongBets.Remove(x);
                        UnmatchedShortBets.Remove(sb);

                        PendingMatched.Add(g);

                        SendMessage(new MatchPending(x.User, g.Uid, sb.User));
                        SendMessage(new MatchPending(sb.User, g.Uid, x.User));
                    }
                });

                Thread.Sleep(500);
            }
        }

        public void AddBet(BetModel model)
        {
            if (model.Long)
            {
                UnmatchedLongBets.Add(model);
            }
            else if (model.Short)
            {
                UnmatchedShortBets.Add(model);
            }

            SendMessage(new BetPlaced(model.User, model.Amount, model.Long, model.Short));
        }

        public void PriceUpdated(ResponseKlineStreamModel data)
        {
            #region Match process
            var unixDate = data.EventTime;
            var openPrice = data.KlineItems.OpenPrice;

            if (PendingMatched.Count > 0)
            {
                //TODO Matched and PendingMatched can be filled with new values between steps
                //var g = PendingMatched.Select(x => x.Uid);

                var gids = PendingMatched.Select(x => x.Uid);

                Matched.AddRange(PendingMatched.Where(x => gids.Contains(x.Uid)));

                PendingMatched.Where(x => gids.Contains(x.Uid)).ToList().ForEach(x =>
                {
                    TimeMatches.Add(unixDate + ThresholdTime, x.Uid);
                    LongPriceMatches.Add(openPrice + Threshold, x.Uid);
                    ShortPriceMatches.Add(openPrice - Threshold, x.Uid);
                    
                    SendMessage(new MatchStarted(x.PlayerWhoBetLong, openPrice));
                    SendMessage(new MatchStarted(x.PlayerWhoBetShort, openPrice));
                });
                PendingMatched.RemoveAll(x => Matched.Select(y => y.Uid).Contains(x.Uid));
            }

            Matched.ForEach(x => x.KlineStreams.Add(data));
            #endregion

            LongPriceMatches.Keys.ToList().ForEach(x =>
            {
                if (x > openPrice + Threshold)
                    EndGame(LongPriceMatches[x]);
            });

            ShortPriceMatches.Keys.ToList().ForEach(x =>
            {
                if (x < openPrice - Threshold)
                    EndGame(ShortPriceMatches[x]);
            });

            TimeMatches.Keys.ToList().ForEach(x =>
            {
                if (x > unixDate + ThresholdTime)
                    EndGame(TimeMatches[x]);
            });
        }

        public void EndGame(Guid gid)
        {
            var g = Matched.FirstOrDefault(q => q.Uid == gid);

            Matched.Remove(g);
            EndedMatches.Add(g);

            LongPriceMatches.Remove(LongPriceMatches.FirstOrDefault(m => m.Value == g.Uid).Key);
            ShortPriceMatches.Remove(ShortPriceMatches.FirstOrDefault(m => m.Value == g.Uid).Key);
            TimeMatches.Remove(TimeMatches.FirstOrDefault(m => m.Value == g.Uid).Key);

            SendMessage(new GameEnded(g.PlayerWhoBetShort));
            SendMessage(new GameEnded(g.PlayerWhoBetLong));
        }

        public void SendMessage(SignalMessage message)
        {
            var cl = klineHub.Clients.Client(EmailConnectionId[message.Player.Email]);

            klineHub.Clients.Client(EmailConnectionId[message.Player.Email]).SendAsync(message.Name, message);
            Console.WriteLine($"Connection: {message.Player.SignalRConnection} | {message.Name}: {message}");
        }
    }
}

namespace SignalREvents
{
    public class BetPlaced : SignalMessage
    {
        public BetPlaced(Player receiver, decimal amount, bool @long, bool @short) : base(receiver, nameof(BetPlaced))
        {
            Amount = amount;
            Long = @long;
            Short = @short;
        }

        public decimal Amount { get; set; }
        public bool Long { get; set; }
        public bool Short { get; set; }

        public override string ToString()
        {
            var bet = Long ? nameof(Long) : nameof(Short);

            return $"E: {Player.Email} ${Amount} {bet}";
        }
    }

    public class MatchPending : SignalMessage
    {
        public MatchPending(Player receiver, Guid gid, Player opponent) : base(receiver, nameof(MatchPending))
        {
            GameId = gid;
            Opponent = opponent;
        }

        public Guid GameId { get; set; }

        public Player Opponent { get; set; }

        public override string ToString() => $"E: {Player.Email} Opponent: {Opponent.Email}";
    }

    public class MatchStarted : SignalMessage
    {
        public MatchStarted(Player receiver, decimal startPrice) : base(receiver, nameof(MatchStarted))
        {
            StartPrice = startPrice;
        }

        public decimal StartPrice { get; set; }
    }

    public class GameEnded : SignalMessage
    {
        public GameEnded(Player receiver) : base(receiver, nameof(GameEnded))
        {
        }

        public bool Won { get; set; }
    }

    public class PriceEvent : SignalMessage
    {
        public PriceEvent(Player receiver, decimal currentPrice, long currentUnix) : base(receiver, nameof(PriceEvent))
        {
            CurrentPrice = currentPrice;
            CurrentUnix = currentUnix;
        }

        public decimal CurrentPrice { get; set; }
        public long CurrentUnix { get; set; }
    }

    public class SignalMessage
    {
        public SignalMessage(Player receiver, string name)
        {
            Player = receiver;
            Name = name;
        }

        public Player Player { get; set; }
        public string Name { get; set; }
    }
}

public class Constants
{
    public string GameEnded { get; set; } = nameof(GameEnded);
    public string GameStarted { get; set; } = nameof(GameStarted);
    public string TimeElapsed { get; set; } = nameof(TimeElapsed);
}

public class BetModel
{
    public decimal Amount { get; set; }
    public Player User { get; set; }
    public bool Long { get; set; }
    public bool Short { get; set; }
}

public class Player
{
    public uint Account { get; set; }
    public string SignalRConnection { get; set; }
    public string Email { get; set; }
}

public partial class Game
{
    public Guid Uid { get; set; } = Guid.NewGuid();

    public Player PlayerWhoBetShort { get; set; }
    public Player PlayerWhoBetLong { get; set; }

    public decimal Amount { get; set; }
    public int StartUnix { get; set; }

    public decimal StartPrice { get; set; }
    public decimal EndPrice { get; set; }

    public List<ResponseKlineStreamModel> KlineStreams { get; set; } = new List<ResponseKlineStreamModel>();
}