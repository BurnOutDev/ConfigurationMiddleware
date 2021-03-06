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

namespace CryptoVision.Api.Services
{
    public class GameService
    {
        public decimal LastPrice { get; set; }
        public IHubContext<KlineHub> BetHub { get; set; }

        private int Threshold = 5;
        private int ThresholdTime = 60000;

        public Timer MatchingTimer { get; set; }

        public SortedDictionary<long, Guid> TimeMatches { get; set; }
        public SortedDictionary<decimal, Guid> LongPriceMatches { get; set; }
        public SortedDictionary<decimal, Guid> ShortPriceMatches { get; set; }

        public HashSet<BetModel> UnmatchedLongBets { get; set; }
        public HashSet<BetModel> UnmatchedShortBets { get; set; }

        public List<Game> PendingMatched { get; set; }
        public List<Game> Matched { get; set; }

        public List<Game> EndedMatches { get; set; }

        public GameService()
        {
            UnmatchedShortBets = new HashSet<BetModel>();
            UnmatchedLongBets = new HashSet<BetModel>();
            TimeMatches = new SortedDictionary<long, Guid>();
            LongPriceMatches = new SortedDictionary<decimal, Guid>();
            ShortPriceMatches = new SortedDictionary<decimal, Guid>();
            PendingMatched = new List<Game>();
            Matched = new List<Game>();
            EndedMatches = new List<Game>();

            MatchingTimer = new Timer();
            MatchingTimer.Interval = 500;
            MatchingTimer.Elapsed += MatchingTimer_Elapsed;
            MatchingTimer.Start();
        }

        private void MatchingTimer_Elapsed(object sender, ElapsedEventArgs e)
        {
            var matched = UnmatchedLongBets.Join(UnmatchedShortBets, @long => @long.Amount, @short => @short.Amount, (@long, @short) => new Tuple<BetModel, BetModel, Game>(
                @long, @short, new Game
                {
                    Amount = @long.Amount,
                    PlayerWhoBetShort = @short.User,
                    PlayerWhoBetLong = @long.User
                })).ToList();

            matched.ForEach(p =>
            {
                UnmatchedLongBets.Remove(p.Item1);
                UnmatchedShortBets.Remove(p.Item2);

                PendingMatched.Add(p.Item3);

                SendMessage(nameof(MatchPending), new MatchPending(p.Item1.User, p.Item3.Uid, p.Item2.User));
                SendMessage(nameof(MatchPending), new MatchPending(p.Item2.User, p.Item3.Uid, p.Item1.User));
            });
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

            SendMessage(nameof(BetPlaced), new BetPlaced(model.User, model.Amount, model.Long, model.Short));
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

                Matched.AddRange(PendingMatched);
                PendingMatched.ForEach(x =>
                {
                    TimeMatches.Add(unixDate + ThresholdTime, x.Uid);
                    LongPriceMatches.Add(openPrice + Threshold, x.Uid);
                    ShortPriceMatches.Add(openPrice + Threshold, x.Uid);
                    ;
                    SendMessage(nameof(MatchStarted), new MatchStarted(x.PlayerWhoBetLong, openPrice));
                    SendMessage(nameof(MatchStarted), new MatchStarted(x.PlayerWhoBetShort, openPrice));
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

            SendMessage(nameof(GameEnded), new GameEnded(g.PlayerWhoBetShort));
            SendMessage(nameof(GameEnded), new GameEnded(g.PlayerWhoBetLong));
        }
        
        public void SendMessage(string name, SignalMessage message)
        {
            //BetHub.Clients.Client(connectionId).SendAsync(name, message);
            Console.WriteLine($"Connection: {message.Player.SignalRConnection} | {name}: {message}");
        }
    }
}

namespace SignalREvents
{
    public class BetPlaced : SignalMessage
    {
        public BetPlaced(Player receiver, decimal amount, bool @long, bool @short) : base(receiver)
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
        public MatchPending(Player receiver, Guid gid, Player opponent) : base(receiver)
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
        public MatchStarted(Player receiver, decimal startPrice) : base(receiver)
        {
            StartPrice = startPrice;
        }

        public decimal StartPrice { get; set; }
    }

    public class GameEnded : SignalMessage
    {
        public GameEnded(Player receiver) : base(receiver)
        {
        }

        public bool Won { get; set; }
    }

    public class PriceUpdated : SignalMessage
    {
        public PriceUpdated(Player receiver, decimal price) : base(receiver)
        {

        }
    }

    public class SignalMessage
    {
        public SignalMessage(Player receiver)
        {
            Player = receiver;
        }

        public Player Player { get; set; }
    }
}

public class Constants
{
    public string GameEnded { get; set; } = nameof(GameEnded);
    public string GameStarted { get; set; } = nameof(GameStarted);
    public string TimeElapsed { get; set; } = nameof(TimeElapsed);
}

public class PriceEvent
{
    public decimal CurrentPrice { get; set; }
    public int CurrentUnix { get; set; }
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