

function Scoreboard(props) {

    const {pScore, aScore} = props;

    return (
        <div className='scoreBoard'>
            <h1 className='score'>Player: {pScore}</h1>
            <h1 className='score'>VS</h1>
            <h1 className='score'>Agent: {aScore}</h1>
        </div>
    )
}

export default Scoreboard;