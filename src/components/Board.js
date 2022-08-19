
function Board(props) {

    let {board, boardClick} = props;

    function transformBoard() {
        let copyBoard = [...board];
        let newBoard = [];

        while (copyBoard.length > 0) {
            newBoard.push(copyBoard.splice(0, 3));
        }

        console.log(newBoard);
        return newBoard;
    }

    return (
        <table className='board'>
            <tbody>
               {transformBoard().map((row, rowID) => 
                    <tr key={rowID} >
                        {row.map((value, cellID) => 
                            <td onClick={boardClick} key={cellID} id={`c${rowID*3+cellID}`} className={value !== 'E' ? value : ""} >
                                {value !== 'E' &&  <span className='boardSymbols' >{value}</span> }
                            </td>
                        )}
                    </tr>
               )}
            </tbody>
        </table>
    )
}

export default Board;