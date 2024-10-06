import React, {useEffect, useState} from 'react';

import './app.scss';

import Board from './board';
import Header from './header';
import ErrorModal from './errormodal';
import { get, post } from './request';
import { setError, setUserId, clearUserId, setUsername, selectUsername, setGameId, selectGameId, selectGameData, selectUserId } from './redux/reducers/game';
import { useAppSelector, useAppDispatch } from './redux/hooks';
import { connect as socketConnect } from './socket';
import { canStart } from './common/game';

function ControlBar() {
  const gameId = useAppSelector(selectGameId);
  const userId = useAppSelector(selectUserId);
  const dispatch = useAppDispatch();

  const gameData = useAppSelector(selectGameData);

  const [joinGameId, setJoinGameId] = useState<string>("");

  async function joinGame(e: React.FormEvent) {
    e.preventDefault();
    const gameIdNumber = parseInt(joinGameId);
    if (!gameIdNumber) {
      return;
    }

    const result = await post("/join", {gameId: gameIdNumber});
    if (result) {
      const { id } = result;
      dispatch(setGameId(gameIdNumber));
      socketConnect(gameIdNumber);
    }
  }

  async function createGame() {
    const result = await post("/create", {});
    if (result) {
      const { id } = result;
      dispatch(setGameId(id));
      socketConnect(id);
    }
  }

  function renderNotInGame() {
    return <div className="controls">
      <button onClick={createGame}>Create game</button>
      <form onSubmit={joinGame}>
        <input type="number" value={joinGameId} onChange={(e) => setJoinGameId(e.target.value)} />
        <input type="submit" value="Join game" />
      </form>
    </div>
  }
  console.log(`my user id: ${userId}`)

  function renderInGame() {
    if (!gameData) return <></>;
    return (
      <div className="controls">
        <div>You are currently in game #{gameData.id}</div>
        <div>
          <h3>Players</h3>
          <div>
            {gameData.userOneUsername}
          </div>
          <div>
            {gameData.userTwoUsername}
          </div>
          <div className="turn">
            {canStart(gameData) && gameData.currentTurnUserId === userId && <div>It's your turn!</div>}
          </div>
        </div>
      </div>

    )
  }

  return (
    <div className="controlBar">
      {gameData && renderInGame()}
      {!gameData && renderNotInGame()}
    </div>
  )
}

export default function App() {
  const username = useAppSelector(selectUsername);
  const dispatch = useAppDispatch();

  async function getAuth() {
    const result = await get("/authDetails");
    if (result) {
      const { username } = result;
      dispatch(setUsername(username));
    }
  }

  useEffect(() => {
    getAuth();
  }, []);

  return (
    <>
      <Header/>
      <div className="app">
        <Board/>
        <ControlBar />
      </div>
      <ErrorModal/>
    </>
  );
}