using CryptoVision.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CryptoVision.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BetController : ControllerBase
    {
        private readonly GameService gameService;

        public BetController(GameService gameService)
        {
            this.gameService = gameService;
        }

        [HttpPost]
        public IActionResult AddBet(BetModel request)
        {
            gameService.AddBet(request);

            return Ok();
        }
    }
}
