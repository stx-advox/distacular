import logo from "../logo.svg";

const Home = () => {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>I know this is react boilerplate, thank you.</p>
          <a
            className="App-link"
            href="https://discord.com/oauth2/authorize?client_id=957992867954045059&permissions=0&scope=bot%20applications.commands"
            target="_blank"
            rel="noopener noreferrer"
          >
            Invite bot to server
          </a>
        </header>
      </div>
    );
};

export default Home