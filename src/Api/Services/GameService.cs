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

namespace CryptoVision.Api.Services
{
    public class GameService
    {
        public decimal LastPrice { get; set; }
        public IHubContext<KlineHub> BetHub { get; set; }

        private int Threshold = 5;

        public Timer MatchingTimer { get; set; }

        public SortedDictionary<long, Game> TimeMatches { get; set; }
        public SortedDictionary<decimal, Game> PriceMatches { get; set; }

        public HashSet<BetModel> UnmatchedLongBets { get; set; }
        public HashSet<BetModel> UnmatchedShortBets { get; set; }

        public List<Game> EndedMatches { get; set; }

        public GameService()
        {
            UnmatchedShortBets = new HashSet<BetModel>();
            UnmatchedLongBets = new HashSet<BetModel>();
            TimeMatches = new SortedDictionary<long, Game>();
            PriceMatches = new SortedDictionary<decimal, Game>();

            MatchingTimer = new Timer();
            MatchingTimer.Interval = 500;
            MatchingTimer.Elapsed += MatchingTimer_Elapsed;
        }

        private void MatchingTimer_Elapsed(object sender, ElapsedEventArgs e)
        {
            var matched = UnmatchedLongBets.Join(UnmatchedShortBets, o => o.Amount, i => i.Amount, (o, i) => new Game
            {
                Amount = o.Amount,
                PlayerWhoBetShort = o.Long ? i.User : o.User,
                PlayerWhoBetLong = o.Short ? i.User : o.User
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
        }

        public void PriceUpdated(ResponseKlineStreamModel data)
        {
            PriceMatches.Select(x => x.Value).ToList().ForEach(x => x.KlineStreams.Add(data));
        }

        public void CheckEndedGamesAndSendEvent()
        {
            EndedMatches.ForEach(match =>
            {
                BetHub.Clients.Client(match.PlayerWhoBetLong.SignalRConnection).SendAsync(nameof(GameEnded), new GameEnded());
                BetHub.Clients.Client(match.PlayerWhoBetShort.SignalRConnection).SendAsync(nameof(GameEnded), new GameEnded());
            });
        }
    }
}

namespace SignalREvents
{
    public class GameEnded
    {
        public bool Won { get; set; }
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

    public class Player
    {
        public uint Account { get; set; }
        public string SignalRConnection { get; set; }
        public string Email { get; set; }
    }
}