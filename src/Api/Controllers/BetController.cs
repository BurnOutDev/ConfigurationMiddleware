using Api.Controllers;
using Application;
using CryptoVision.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace CryptoVision.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BetController : BaseController
    {
        private readonly GameService gameService;
        private readonly IAccountService accountService;

        public BetController(GameService gameService, IAccountService accountService)
        {
            this.gameService = gameService;
            this.accountService = accountService;
        }

        [HttpPost]
        public IActionResult AddBet(BetPlacement request)
        {
            gameService.AddBet(new BetModel
            {
                Amount = request.Amount,
                Long = request.IsRiseOrFall,
                Short = !request.IsRiseOrFall,
                User = new Player
                {
                    Email = Account.Email,
                    Name = $"{Account.FirstName} {Account.LastName}"
                }
            });

            return Ok();
        }
    }

    public class BetPlacement
    {
        public decimal Amount { get; set; }
        public bool IsRiseOrFall { get; set; }
    }
}
