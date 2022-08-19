

function Setup(props) {

    let {playerSymbol, agentSymbol, difficulty, chooseSymbol} = props;

    return(
        <div className="setup">
            {(playerSymbol === '' && agentSymbol === '') ?
                <div className='choosingSymbol'>
                    <button onClick={chooseSymbol} id='O' className='playO'>Play as <span onClick={chooseSymbol} id='O'>O</span></button>
                    <button onClick={chooseSymbol} id='X' className='playX'>Play as <span onClick={chooseSymbol} id='X'>X</span></button>
                </div> :
                <h2 className='info'> You are playing as <span className='symbol' >{playerSymbol}</span> | Difficulty:<span className={difficulty} >{difficulty}</span> </h2>
            }
        </div>
    )

}



export default Setup;