using Api.Controllers;
using CryptoVision.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CryptoVision.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BetController : BaseController
    {
        private readonly GameService gameService;

        public BetController(GameService gameService)
        {
            this.gameService = gameService;
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
                    Email = Account.Email
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
