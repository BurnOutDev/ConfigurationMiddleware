using CryptoVision.Api.Helpers;
using CryptoVision.Api.Models;
using CryptoVision.Api.Services;
using CryptoVision.Core.Accounts;
using CryptoVision.Core.Accounts.Commands;
using CryptoVision.Core.Accounts.Dtos;
using CryptoVision.Core.Accounts.Queries;
using CryptoVision.Core.Permissions;
using CryptoVision.Shared.CommandsAndQueries;
using CryptoVision.Shared.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

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

        public IActionResult AddBet(BetModel request)
        {
            gameService.AddBet(request);

            return Ok();
        }
    }
}
