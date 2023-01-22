
import image_X from '../images/x_image.png'
import image_O from '../images/o_image.png'


function Board(props) {

    let {board, boardClick, gameMessage} = props;

    function transformBoard() {
        let copyBoard = [...board];
        let newBoard = [];

        while (copyBoard.length > 0) {
            newBoard.push(copyBoard.splice(0, 3));
        }

        return newBoard;
    }

    return (
        <div className='board'>
                {transformBoard().map((row, rowID) =>
                    <div key={rowID} className={"rows"}>
                        {row.map((value, cellID) =>
                            <div onClick={boardClick} key={cellID} id={`c${rowID * 3 + cellID}`} className={value !== 'E' ? "cells " + value : "cells"} >
                                {value === 'X' && <img src={image_X} alt="X" className='boardSymbols' /> }
                                {value === 'O' && <img src={image_O} alt="O" className='boardSymbols'/> }
                            </div>
                        )}
                    </div>
                )}
            {gameMessage !== "" && <h1 className={`results ${gameMessage}`}>{gameMessage}</h1>}
        </div> 
    )
}

export default Board;