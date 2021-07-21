const gameBoard = (() => {
  let board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  
  const getBoard = () => board;
  const valueIsNumber = (index) => typeof board[index] === 'number';
  const updateBoard = (index, letter) => board[index] = letter;
  const resetBoard = () => board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  
  const _boardCombinations = (optBoard) => {
    let checkBoard = optBoard || board;
    let comb = [];
    let dialgonal = [];
    let dialgonal_rev = [];
    // ROWS

    for( let i = 0; i < checkBoard.length; i += 3) {
      comb.push(board.slice(i, i + 3))
    }

    // DIAGONALS

    for (let i = 0; i < comb[0].length; i++) {
      dialgonal.push(comb[i][i]);
      dialgonal_rev.push(comb[i][comb[0].length - i - 1]);
    }

    comb.push(dialgonal, dialgonal_rev);

    // COLUMNS

    for (let i = 0; i < comb[0].length; i++) {
      let tempArr = [];
      for (let j = i; j < checkBoard.length; j += 3) {
        tempArr.push(checkBoard[j]);
      }
      comb.push(tempArr);
    }
    return comb;
  }

  const _isEightLetters = () => {
    let total = board.reduce((sum, val, index) => {
      !gameBoard.valueIsNumber(index) && sum++;
      return sum;
    }, 0);
    return total == 8 ? true : false; 
  }

  const isWin = (player, optBoard) => {
    let comb = _boardCombinations(optBoard);
    return comb.some((row) => row.every((value) => value === player.getLetter()))
  };

 /*
  CHECK IS THERE ARE 8 LETTER IN THE BOARD. 
  MAKE A COPY OF THE BOARD AND REPLACE THE EMPTY ONE WITH THE LETTER OF THE PLAYER.
  IF THE PLAYER DON'T WIN WITH THAT MOVE, IT'S A DRAW.
 */

  const isDraw = (player) => {
    if(_isEightLetters()) {
      
      let futureBoard = Array.from(board);
      futureBoard = futureBoard.map((value, index) => { 
        gameBoard.valueIsNumber(index) && (value = player.getLetter());
      })

      return !isWin(player, futureBoard);
    }
    return false;
  }
  
  return { getBoard, resetBoard, valueIsNumber, updateBoard, isWin, isDraw }

})();


const Player = (playerName, letter) => {
  let score = 0;
  
  const getPlayerName = () => playerName;
  const setPlayerName = (newName) => playerName = newName || playerName; 
  const getLetter = () => letter;
  const getScore = () => score;
  const resetScore = () => score = 0;
  const winRound = () => ++score;
  const isMatchWin = (nSets) => {
    return (parseInt(nSets) + 1) / 2 == score;
  }

  return { getPlayerName, setPlayerName, getLetter, getScore, resetScore, winRound, isMatchWin };
}

const WinMessage = (() => {
  const winMessageDOM = document.getElementById('win-message');
  const titleContent =  winMessageDOM.querySelector('h2');
  const messageContent = winMessageDOM.querySelector('#win-message-content');
  const playBtn = winMessageDOM.querySelector('.play-btn');
  const restartBtnBoard = document.querySelector('.main-content .play-btn');
  const closeBtn = winMessageDOM.querySelector('.close-btn');

  const _writeMessage = (player, match) => {
    titleContent.textContent = "Victory";
    messageContent.textContent = `${player.getPlayerName()} has won the ${ match ? "match" : "round"}.`;
  }
  const _writeButton = (match) => {
    playBtn.querySelector('span').textContent = match ? "Restart" : "Continue";
  }
  const _toggleHide = () => {
    winMessageDOM.classList.toggle('hide');
  }
  const _displayMessage = (match) => {
    _toggleHide();
    match && winMessageDOM.classList.add('has-background');
  }

  const win = (player, match) => {
    _writeMessage(player, match);
    _writeButton(match)
    _displayMessage(match);
  }

  const draw = () => {
    titleContent.textContent = "Draw"
    messageContent.textContent = "It's a draw.";
    _writeButton(false);
    _displayMessage(false);
  }

  closeBtn.addEventListener('click',() => {
    _toggleHide();
    playBtn.firstElementChild.textContent == "Restart" ? gameFlow.restart() : gameFlow.nextRound();
  })
  playBtn.addEventListener('click',(e) => {
    _toggleHide();
    e.target.textContent == "Restart" ? gameFlow.restart() : gameFlow.nextRound();
  })
  restartBtnBoard.addEventListener('click',(e) => {
    e.target.textContent == "Restart" ? gameFlow.restart() : gameFlow.nextRound();
  })
  

  return {win, draw};
})();

const gameFlow = (() => {
  
  const pj1 = Player('Player 1', 'X');
  const pj2 = Player('Player 2', 'O');
  let turn = true;
  let numbSets = 1;

  
  // CACHED DOM
  const form = document.getElementById('form-container');
  const formClose = form.querySelector('.close-btn');
  const resetButtons = document.querySelectorAll('.btn.reset');
  const boardDOM = document.getElementById('board');
  const boardCells = document.querySelectorAll('.board-cell');
  const scorePj1 = document.querySelector('article.pj-1 .score');
  const scorePj2 = document.querySelector('article.pj-2 .score');
  
  const addWinScoreBar = (scoreBar) => {
    for (const child of scoreBar.children) {
      if(!child.classList.contains('point')){
        child.classList.add('point');
        break;
      }
    }
  }
  const resetWinScoreBar = () => {
    for (const child of scorePj1.children) {
      if(child.classList.contains('point')){
        child.classList.remove('point');
      }
    }
    for (const child of scorePj2.children) {
      if(child.classList.contains('point')){
        child.classList.remove('point');
      }
    }
  }

  const nextRound = () => {
    gameBoard.resetBoard();
    turn = true;
    for (let child of boardDOM.children) {
      child.textContent = "";
    }
  }

  
  const toggleHide = (e) => {
    e.target.parentElement.parentElement.parentElement.classList.toggle("hide");
  }

  const resetForm = () => {
    form.querySelector('input[name="player1-name"]').value = "Player 1";
    form.querySelector('input[name="player2-name"]').value = "Player 2";
  }

  const restart = () => {
    nextRound();
    resetWinScoreBar();
    pj1.resetScore();
    pj2.resetScore();
  }

  const reset = () => {
    location.reload(); 
  }

  const writePlayersNames = () => {
    let namesDOM = document.querySelectorAll('h2.name');
    namesDOM[0].textContent = pj1.getPlayerName();
    namesDOM[1].textContent = pj2.getPlayerName();
  }

  const writeScoreCells = () => {

    for (let i = 0; i < numbSets; i++) {
      let div1 = document.createElement('div');
      let div2 = document.createElement('div');
      
      div1.classList.add('score-cell', `size-1-${numbSets}`);
      div2.classList.add('score-cell', `size-1-${numbSets}`);
     
      scorePj1.appendChild(div1);
      scorePj2.appendChild(div2);
    }
  }

  formClose.addEventListener('click', toggleHide);
  formClose.addEventListener('click', writePlayersNames);
  resetButtons.forEach(e => e.addEventListener('click', reset));

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    
    let pj1Name = form.querySelector('input[name="player1-name"]').value;
    let pj2Name = form.querySelector('input[name="player2-name"]').value;
    numbSets = form.querySelector('input[name="number-sets"]:checked').value;
    document.getElementById('best-of').textContent += numbSets;   
    pj1.setPlayerName(pj1Name);
    pj2.setPlayerName(pj2Name);
  
    writePlayersNames();
    writeScoreCells();
    resetForm();
    form.classList.toggle('hide');
  })


  const round = (e) => {
    let playerTurn = turn ? pj1 : pj2;
    let targetBoardCell = e.target;
    let index = Array.prototype.indexOf.call(boardDOM.children, targetBoardCell);

    if (gameBoard.valueIsNumber(index)) {
      gameBoard.updateBoard(index, playerTurn.getLetter());
      targetBoardCell.textContent = playerTurn.getLetter();
        
      if(gameBoard.isWin(playerTurn)){
        console.log("EHEH")
        let pTurnScoreBar = turn ? scorePj1 : scorePj2;
        playerTurn.winRound();
        playerTurn.isMatchWin(numbSets) ? WinMessage.win(playerTurn, true) : WinMessage.win(playerTurn, false);
        addWinScoreBar(pTurnScoreBar);
      }else if (gameBoard.isDraw(playerTurn)){
        console.log("PAPAPAPA")
        WinMessage.draw();
      }        
      turn = !turn;
      }
  }


  boardCells.forEach( e => e.addEventListener('click', round) );
  return {restart, nextRound};
})();

