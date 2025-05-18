import './App.css';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import Game from "./Game.jsx";
import Menu from "./Menu.jsx";
import Footer from "./Footer.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faHamburger} from "@fortawesome/free-solid-svg-icons";
import MenuControl from "./MenuControl.jsx";
import {useState} from "react";


// Parent component wrapping with QueryClientProvider
function App() {
    const [timeout, setTimeout] = useState(10);
    const [highScore, setHighScore] = useState(()=>{
        const savedScores = localStorage.getItem('highScores');
        return savedScores ? JSON.parse(savedScores) : 0;
    })
  const queryClient = new QueryClient();
  return (
      <QueryClientProvider client={queryClient}>
          <div className='container'>
                <Menu setTimeout={setTimeout}/>
                <MenuControl/>
                <Game timeout={timeout} setHighScore={setHighScore} highScore={highScore}/>
              <Footer/>
          </div>
      </QueryClientProvider>
  );
}

export default App;