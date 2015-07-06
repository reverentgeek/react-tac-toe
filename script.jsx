var StartNewGame = React.createClass( {
	render: function() {
		if ( this.props.winner || this.props.started === false ) {
			return (
				<div>
					<button className="btn btn-primary" onClick={ this.props.resetGame.bind( null, 1 ) }>Start 1-Player</button>
					&nbsp;
					<button className="btn btn-primary" onClick={ this.props.resetGame.bind( null, 2 ) }>Start 2-Player</button>
				</div>
				);
		} else {
			return <div></div>;
		}
	}
} );

var WinnerStatus = React.createClass( {
	render: function() {
		if ( this.props.started === false ) {
			return ( <div></div> );
		}
		var r;
		var winner = this.props.winner;
		switch ( winner ) {
			case "x":
				r = "X wins!";
				break;
			case "o":
				r = "O wins!";
				break;
			case "t":
				r = "Tie!";
				break;
			default:
				r = "Current turn: " + this.props.currentTurn;
				break;
		}
		return <div className="well"><h2>{ r }</h2></div>;
	}
} );
var GameGrid = React.createClass( {
	render: function() {
		if ( this.props.started === false ) {
			return ( <div></div> );
		}
		var makeMove = this.props.makeMove;
		var b = this.props.selectedBoxes.map( function( s, i ) {
			var btn;
			switch ( s ) {
				case "x":
					btn = <div className="turn-button disabled">X</div>;
					break;
				case "o":
					btn = <div className="turn-button disabled">O</div>;
					break;
				default:
					btn = <div className="turn-button" onClick={ makeMove.bind( null, i ) } >&nbsp;</div>;
					break;
				break;
			}
			//<span class="glyphicon glyphicon-search" aria-hidden="true"></span>
			return btn;
		} );
		return ( <table id="game-table" className="table table-bordered">
			<tr><td>{ b[0] }</td><td>{ b[1] }</td><td>{ b[2] }</td></tr>
			<tr><td>{ b[3] }</td><td>{ b[4] }</td><td>{ b[5] }</td></tr>
			<tr><td>{ b[6] }</td><td>{ b[7] }</td><td>{ b[8] }</td></tr>
		</table> );
	}
} );

var Main = React.createClass( {
	getInitialState: function() {
		var b = [ "", "", "", "", "", "", "", "", "" ];
		return { winner: null, selectedBoxes: b, currentTurn: "x", started: false };
	},
	resetGame: function( numOfPlayers ) {
		this.replaceState( this.getInitialState() );
		this.setState( { numOfPlayers: numOfPlayers, started: true } );
	},
	makeMove: function( index ) {
		if ( this.state.winner ) {
			return;
		}
		var sb = this.state.selectedBoxes;
		var turn = this.state.currentTurn;
		sb[index] = turn;
		if ( turn === "x" ) {
			turn = "o";
		} else {
			turn = "x";
		}
		this.setState( { selectedButtons: sb, currentTurn: turn }, function() {
			this.calculateWinner( function() {
				if ( !this.state.winner && this.state.numOfPlayers === 1 && this.state.currentTurn === "o" ) {
					var nextMove = this.nextPossibleMove();
					if ( nextMove || nextMove === 0 ) {
						this.makeMove( nextMove );
					} else {
						// declare a tie
						this.setState( { winner: "t" } );
					}
				}
			} );
		} );
	},
	isWinningSet: function( selectedBoxes ) {
		var b = selectedBoxes;
		if ( b[0] !== "" && b[0] === b[1] && b[1] === b[2] ) {
			return b[0];
		}
		if ( b[1] !== "" && b[1] === b[4] && b[1] === b[7] ) {
			return b[1];
		}
		if ( b[2] !== "" && b[2] === b[5] && b[2] === b[8] ) {
			return b[2];
		}
		if ( b[0] !== "" && b[0] === b[4] && b[0] === b[8] ) {
			return b[0];
		}
		if ( b[2] !== "" && b[2] === b[4] && b[2] === b[6] ) {
			return b[2];
		}
		if ( b[0] !== "" && b[0] === b[3] && b[0] === b[6] ) {
			return b[0];
		}
		if ( b[3] !== "" && b[3] === b[4] && b[3] === b[5] ) {
			return b[3];
		}
		if ( b[6] !== "" && b[6] === b[7] && b[6] === b[8] ) {
			return b[6];
		}
		if ( b.indexOf( "" ) === -1 ) {
			return "t";
		}
		return null;
	},
	calculateWinner: function( callback ) {
		var b = this.state.selectedBoxes;
		var w = this.isWinningSet( b );
		this.setState( { winner: w }, callback );
	},
	nextPossibleMove: function() {
		var b = this.state.selectedBoxes;
		var p = this.state.currentTurn;
		var opponent = ( p === "o" ) ? "x" : "o";
		var availableMoves = [];
		for ( var i = 0; i < b.length; i++ ) {
			if ( b[i] === "" ) {
				availableMoves.push( i );
			}
		}

		if ( availableMoves.length === 0 ) {
			return null;
		}

		// is there a play where p can win?
		for ( var i = 0; i < availableMoves.length; i++ ) {
			var index = availableMoves[i];
			b[index] = p;
			if ( p === this.isWinningSet( b ) ) {
				return index;
			} else {
				b[index] = "";
			}
		}

		// is opponent about to make a winning move?
		for ( var i = 0; i < availableMoves.length; i++ ) {
			var index = availableMoves[i];
			b[index] = opponent;
			if ( opponent === this.isWinningSet( b ) ) {
				return index;
			} else {
				b[index] = "";
			}
		}

		// is there a winning move in two moves?
		for ( var i = 0; i < availableMoves.length; i++ ) {
			var m1 = availableMoves[i];
			b[m1] = p;
			for ( var j = 0; j < availableMoves.length; j++ ) {
				if ( i === j ) {
					continue;
				}
				var m2 = availableMoves[j];
				b[m2] = p;
				if ( p === this.isWinningSet( b ) ) {
					b[m1] = "";
					b[m2] = "";
					return m1;
				} else {
					b[m2] = "";
				}
			}
			b[m1] = "";
		}

		// Take center, if available
		if ( b[4] === "" ) {
			return 4;
		}

		// take next available move
		return availableMoves[0];
	},
	render: function() {
		return (
			<div>
				<h1>React-Tac-Toe</h1>
				<GameGrid selectedBoxes={ this.state.selectedBoxes } started={ this.state.started } winner={ this.state.winner } makeMove={ this.makeMove } />
				<WinnerStatus winner={ this.state.winner } started={ this.state.started } currentTurn={ this.state.currentTurn } />
				<StartNewGame winner={ this.state.winner } started={ this.state.started } resetGame={ this.resetGame } />
			</div>
			);
	}
} );

React.render(
	<Main name="World" />,
	document.getElementById( "container" )
);
