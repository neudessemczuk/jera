// Carregando Facebook SDK
window.fbAsyncInit = function() {
    FB.init({
      appId      : 'your-app-id',
      cookie     : true,
      xfbml      : true,
      version    : 'v13.0' 
    });
  
    // Criando botão de login
    document.getElementById('facebook-login-button').innerHTML = '<button onclick="facebookLogin()">Login com Facebook</button>';
  };
  
  // Carregando SDK
  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) return;
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/pt_BR/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
  
  // Lidar com a resposta de login do Facebook
  function facebookLogin() {
    FB.login(function(response) {
      if (response.authResponse) {
        // Detalhes do Usuario
        FB.api('/me', {fields: 'id, name, email, birthday'}, function(userDetails) {
          // Enviar detalhes do usuário para o servidor para criar ou autenticar usuário.
          createUser(userDetails);
        });
      } else {
        console.log('Usuário cancelou o login ou não autorizou completamente.');
      }
    }, {scope: 'email,user_birthday'}); // Solicitar as permissões 'email' e 'user_birthday'
  }
  
  // Criar ou autenticar usuário no servidor
  function createUser(userDetails) {
// Envia uma requisição para o servidor com os detalhes do usuário
// O servidor deve verificar se o usuário já existe no banco de dados
// Se não existir, o servidor deve criar uma nova conta de usuário
// O servidor também deve responder com uma mensagem de sucesso ou erro

// Exemplo de requisição usando a API Fetch
    fetch('/users/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userDetails)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Usuário autenticado com sucesso!');
      } else {
        console.log('Erro ao autenticar usuário: ' + data.message);
      }
    })
    .catch(error => console.error('Erro ao enviar solicitação para o servidor:', error));
  }
  