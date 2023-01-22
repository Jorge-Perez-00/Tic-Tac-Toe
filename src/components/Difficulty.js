


function Difficulty(props) {

    let {setDifficulty} = props;

    return(
        <div className='mode-container'>
            <button onClick={setDifficulty} id='Easy' className='easyButton'>Easy</button>
            <button onClick={setDifficulty} id='Medium' className='mediumButton'>Medium</button>
            <button onClick={setDifficulty} id='Impossible' className='impossibleButton'>Impossible</button>
        </div>  
    )
}

export default Difficulty;