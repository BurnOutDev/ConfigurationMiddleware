import {
  Button,
  Card,
  InputNumber,
  Progress,
  Result,
  Spin,
  Statistic
} from 'antd'
import React from 'react'
import IFrame from 'react-iframe'
import {
  DollarTwoTone,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyTwoTone,
  FundTwoTone
} from '@ant-design/icons'
import getWindowDimensions from '../../helpers/getWindowDimensions'
import Meta from 'antd/lib/card/Meta'
import Avatar from 'antd/lib/avatar/avatar'
import { gamblingService } from '../../services/gambling.service'

const consts = {
  colors: {
    win: '#52c41a',
    loose: '#ff4d4f'
  }
}

const Flexed = ({ children, conditions }) =>
  conditions ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        padding: 16
      }}>
      {children}
    </div>
  ) : (
    <></>
  )

const Gambling = () => {
  const [isEmptyState, setIsEmptyState] = React.useState(true)
  const [isBetPlacedState, setIsBetPlacedState] = React.useState(false)
  const [isMatchStarted, setIsMatchStarted] = React.useState(false)
  const [isMatchEnded, setIsMatchEnded] = React.useState(false)

  const [betAmount, setBetAmount] = React.useState(10)
  const [isRiseOrFall, setIsRiseOrFall] = React.useState(null)

  const [winningText, setWinningText] = React.useState('')
  const [losingText, setLosingText] = React.useState('')

  const [won, setWon] = React.useState(null)

  const [opponentName, setOpponentName] = React.useState('')
  const [openPrice, setOpenPrice] = React.useState(0)
  const [threshold, setThreshold] = React.useState(0)
  const [currentPrice, setCurrentPrice] = React.useState(0)

  const BetPlaced = () => {
    setIsEmptyState(false)
    setIsBetPlacedState(true)
  }

  const MatchPending = (opponentName) => {
    setIsBetPlacedState(false)
    setIsMatchStarted(true)
    setOpponentName(opponentName)
  }

  const ClickShort = () => {
    setIsRiseOrFall(false)
    gamblingService.placeBet(betAmount, false)
  }

  const ClickLong = () => {
    setIsRiseOrFall(true)
    gamblingService.placeBet(betAmount, true)
  }

  //#region Connections

  const hookOnEvents = () => {
    gamblingService.connection.on('BetPlaced', (message) => {
      BetPlaced()
    })

    // gamblingService.connection.on('MatchPending', (message) => {
    //   MatchPending(message.opponentName)
    // })

    gamblingService.connection.on('MatchStarted', (message) => {
      MatchPending(message.player.name)
      setOpenPrice(message.startPrice)
      setThreshold(message.threshold)
    })

    gamblingService.connection.on('PriceEvent', (message) => {
      setCurrentPrice(message.currentPrice)
    })

    gamblingService.connection.on('GameEnded', (message) => {
      setWon(message.won)
      setIsMatchEnded(true)
      setIsMatchStarted(false)
    })
  }

  //#endregion

  React.useEffect(() => {
    hookOnEvents()
  }, [])

  return (
    <div
      style={{
        marginLeft: -55,
        marginRight: -50,
        marginTop: -64,
        display: 'flex',
        flexDirection: 'row'
      }}>
      <IFrame
        url="http://localhost:4200"
        id="myId"
        height={getWindowDimensions().height - 50}
        width={getWindowDimensions().width - 500}
        className="myClassname"
        display="initial"
        position="relative"
      />
      <div style={{ width: 500 }}>
        {/* IsEmptyState */}
        <Flexed conditions={isEmptyState}>
          <InputNumber
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            onChange={setBetAmount}
            value={betAmount}
            step={5}
            disabled={isRiseOrFall !== null}
          />
        </Flexed>
        <Flexed conditions={isEmptyState}>
          <BetButton
            short
            title="Short"
            onClick={ClickShort}
            disabled={isRiseOrFall !== null}
          />
          <BetButton
            title="Long"
            onClick={ClickLong}
            disabled={isRiseOrFall !== null}
          />
        </Flexed>
        {/* IsBetPlaced */}
        <Flexed conditions={isBetPlacedState}>
          <Result
            icon={<Spin size="large" />}
            title="Waiting for opponent..."
          />
        </Flexed>
        <Flexed conditions={isBetPlacedState || isMatchStarted}>
          <Card>
            <Statistic
              title="Bet Amount"
              value={betAmount}
              prefix={<DollarTwoTone />}
            />
          </Card>
          {isMatchStarted && (
            <Card>
              <Statistic
                title="Open Price"
                value={openPrice}
                prefix={<FundTwoTone />}
              />
            </Card>
          )}
          <Card>
            <Statistic
              title="Prediction"
              value={isRiseOrFall ? 'Rise' : 'Fall'}
              valueStyle={{
                color: isRiseOrFall ? '#3f8600' : consts.colors.loose
              }}
              prefix={
                isRiseOrFall ? <ArrowUpOutlined /> : <ArrowDownOutlined />
              }
            />
          </Card>
        </Flexed>
        {/* IsMatchStarted */}
        <Flexed conditions={isMatchStarted}>
          <Result title="Started, Good Luck!" />
        </Flexed>
        <Flexed conditions={isMatchStarted}>
          <Card
            style={{
              width: '100%',
              marginLeft: 16,
              marginRight: 14,
              marginBottom: 16
            }}>
            <Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: isRiseOrFall
                      ? consts.colors.loose
                      : consts.colors.win
                  }}>
                  {opponentName[0]}
                </Avatar>
              }
              title={opponentName}
              description="Rank: 48112"
            />
          </Card>
        </Flexed>
        <Flexed conditions={isMatchStarted}>
          <Progress
            percent={currentPrice - openPrice}
            strokeColor={consts.colors.win}
            trailColor={consts.colors.loose}
            showInfo={false}
            strokeLinecap="square"
            strokeWidth={12}
          />
        </Flexed>
        <Flexed conditions={true}>
          <Statistic title="Threshold" value={threshold} />
          <Statistic title="CurrentPrice" value={currentPrice} />
        </Flexed>
        {/* IsMatchStarted */}
        <Flexed conditions={isMatchEnded}>
          <Result
            icon={<TrophyTwoTone twoToneColor={consts.colors.win} />}
            title={won ? winningText : losingText}
            extra={<Button type="primary">Re-Battle!</Button>}
          />
        </Flexed>
      </div>
    </div>
  )
}

const textsWin = ['Impressive, You Won!']

const getWinningText = () =>
  textsWin[Math.floor(Math.random() * textsWin.length)]

const BetButton = ({ title, short, ...props }) => (
  <Button
    style={{
      width: '50%',
      borderWidth: 0,
      borderRadius: 0,
      backgroundColor: short ? consts.colors.loose : consts.colors.win,
      height: 50
    }}
    type="primary"
    size="large"
    {...props}>
    {title}
  </Button>
)

export { Gambling }
