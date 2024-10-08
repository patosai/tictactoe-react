import React, { useState } from 'react';
import { post } from './request';

import './header.scss';
import './modal.scss';

import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setUsername, clearUsername, selectUsername, setUserId, clearUserId } from './redux/reducers/game';
import Modal from './modal';

type LoginOrRegisterProps = {
  url: string,
  submitText: string,
  onOpen: () => any,
  onClose: () => any,
  shown: boolean
}

function LoginOrRegister({url, submitText, onOpen, onClose, shown}: LoginOrRegisterProps) {
  const [username, setUsernameState] = useState("");
  const [password, setPasswordState] = useState("");

  const dispatch = useAppDispatch();

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await post(url, {username: username, password: password});
    if (result) {
      const { username, userId } = result;
      dispatch(setUsername(username));
      dispatch(setUserId(userId));
    }
    onClose();
  }

  return (
    <>
      {shown && 
      <Modal visible={shown} onClose={onClose}>
        <h2>{submitText}</h2>
        <form onSubmit={onSubmit}>
          <input name="username" value={username} placeholder={"Username"} onChange={e => setUsernameState(e.target.value)} />
          <input type="password" name="password" value={password} placeholder={"Password"} onChange={e => setPasswordState(e.target.value)} />
          <button type="submit">{submitText}</button>
        </form>
      </Modal>}
      <div className="link" onClick={onOpen}>{submitText}</div>
    </>
  );
}

function Logout() {
  const dispatch = useAppDispatch();

  async function onLogout() {
    const result = await post("/logout", {});
    if (result) {
      dispatch(clearUsername());
      dispatch(clearUserId());
    }
  }

  return (
    <div className="link" onClick={onLogout}>Logout</div>
  );
}

export default function Header() {
  const username = useAppSelector(selectUsername);
  const [shownModal, setShownModal] = useState("");

  function onClose() {
    setShownModal("");
  }

  return (
    <header>
      <div className="headerWrapper">
        <div className="left">
          <h2>Tic Tac Toe</h2>
          
        </div>
        <div className="right">
          {username && <div>Logged in as {username}</div>}
          {!username && <LoginOrRegister url={"/login"} submitText={"Login"} onOpen={() => setShownModal("login")} onClose={onClose} shown={shownModal === "login"}/>}
          {!username && <LoginOrRegister url={"/register"} submitText={"Register"} onOpen={() => setShownModal("register")} onClose={onClose} shown={shownModal === "register"}/>}
          {username && <Logout/>}
        </div>
      </div>
    </header>

  );

}