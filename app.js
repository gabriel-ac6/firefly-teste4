const express = require('express');
const app = express();
const path = require('path');
app.use(express.urlencoded({extended: true, limit: '20mb'}));
const axios = require('axios');
const admin = require("firebase-admin");
const bodyParser = require('body-parser');
const fs = require('fs');
const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();
let isOnline = true;


// Função para verificar a conexão com a internet
function checkInternetConnection() {
  axios.get('http://www.google.com', { timeout: 5000 })
    .then(() => {
      if (!isOnline) {
        isOnline = true;
        eventEmitter.emit('online');
        console.log('Conexão de internet restaurada');
      }
    })
    .catch(() => {
      if (isOnline) {
        isOnline = false;
        console.log('Conexão de internet perdida');
      }
    })
    .finally(() => {
      setTimeout(checkInternetConnection, 5000); // Verificar a cada 5 segundos
    });
}



app.set('view engine', 'ejs'); // Configura o mecanismo de visualização como EJS
app.set('views', path.join(__dirname, 'src')); // Define o diretório de visualizações





/* 
Chave da API da OpenWeatherMap
const openWeatherMapApiKey = '909db2171a7383199a57cb791c612812'; // Substitua pela sua própria chave


// Função para coletar dados climáticos da API da OpenWeatherMap com base em latitude e longitude
async function getWeatherData(latitude, longitude) {
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherMapApiKey}`
    );
    // Processar os dados climáticos aqui
    const weatherData = response.data;

    // Verificar se o arquivo JSON já existe
    let existingData = [];
    if (fs.existsSync('weatherData.json')) {
      existingData = JSON.parse(fs.readFileSync('weatherData.json'));
    }

    // Adicionar os novos dados aos dados existentes
    existingData.push(weatherData);

    // Salvar os dados atualizados no arquivo JSON
    fs.writeFileSync('weatherData.json', JSON.stringify(existingData, null, 2));

    console.log('Dados climáticos adicionados a weatherData.json');
  } catch (error) {
    console.error('Erro ao buscar dados climáticos:', error);
  }
}


// Lê o arquivo JSON

fs.readFile(fireData, 'utf8', (err, data) => {
  if (err) {
    console.error('Erro ao ler o arquivo JSON:', err);
    return;
  }

  try {
    // Analisa o conteúdo JSON em um array de objetos
   
    const jsonData = JSON.parse(data);

    // Lista as latitudes e longitudes
    jsonData.forEach((item, index) => {
     
      latitude = item.latitude;
      longitude = item.longitude;
      
      getWeatherData(latitude, longitude);

    });
    
  } catch (err) {
    console.error('Erro ao analisar o JSON:', err);
  }
});


//combinação das bases de dados

const geolib = require('geolib');

// Carregue os dados dos arquivos JSON
const queimadasData = JSON.parse(fs.readFileSync('dados_de_queimadas.json', 'utf8'));
const weatherData = JSON.parse(fs.readFileSync('weatherData.json', 'utf8'));

// Função para encontrar a correspondência mais próxima com base nas coordenadas
function findClosestWeather(lat, lon) {
    let minDistance = 1000; // Inicialize com um valor maior que 1000 (1 km em metros)
    let closestWeather = null;

    for (const weather of weatherData) {
        const weatherLat = weather.coord.lat;
        const weatherLon = weather.coord.lon;

        // Calcule a distância entre as coordenadas
        const distance = geolib.getDistance(
            { latitude: lat, longitude: lon },
            { latitude: weatherLat, longitude: weatherLon }
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestWeather = weather;
        }
    }

    if (minDistance <= 1000) { // Verifique se a distância é menor ou igual a 1 km (1000 metros)
        return closestWeather;
    } else {
        return null; // Retorna null se nenhuma correspondência dentro de 1 km for encontrada
    }
}

// Percorra os dados de queimadas
for (let queimada of queimadasData) {
  const queimadaLat = parseFloat(queimada.latitude);
  const queimadaLon = parseFloat(queimada.longitude);

  // Encontre a correspondência mais próxima nos dados de clima
  const closestWeather = findClosestWeather(queimadaLat, queimadaLon);

  if (closestWeather) {
      console.log('Queimada:', queimadaLat, queimadaLon);
      console.log('Clima:', closestWeather.coord.lat, closestWeather.coord.lon);

      // Adicione os dados de clima ao objeto de queimadas
      queimada.weather = closestWeather;
  } else {
      console.log('Nenhum clima dentro de 1 km encontrado para a queimada:', queimadaLat, queimadaLon);
  }
}

// Agora que você adicionou os dados de clima às entradas de queimadas,
// você pode criar uma nova variável para armazenar as queimadas com clima
const queimadasComClima = queimadasData.filter(queimada => queimada.weather);

// Agora que você tem as queimadas com clima em uma nova variável,
// você pode fazer o que quiser com elas, por exemplo, salvar os resultados em um novo arquivo JSON
fs.writeFileSync('queimadas_com_clima.json', JSON.stringify(queimadasComClima, null, 4));



/*
// Função para obter informações sobre o tipo de vegetação com base em coordenadas
async function getVegetationInfo(latitude, longitude) {
  try {
    const apiUrl = `https://api.nasa.gov/planetary/earth/assets?lon=${longitude}&lat=${latitude}&date=2022-01-01T00:00:00Z&dim=0.1&api_key=8Tzjhrjzh5yEVBU87KUr4KXSz3bAE86EA1pw60yr`;

    const response = await axios.get(apiUrl);
    const vegetationData = response.data;

    return vegetationData;
  } catch (error) {
    if (error.response && error.response.status === 503) {
      console.error('A API da NASA está temporariamente indisponível. Tente novamente mais tarde.');
    } else {
      console.error('Erro ao obter dados de cobertura vegetal:', error);
    }
    return null;
  }
}

// Função principal para processar o arquivo JSON
async function processJSONData() {
  const jsonFileName = 'queimadas_com_clima.json';

  fs.readFile(jsonFileName, 'utf8', async (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo JSON:', err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      const latitude = jsonData.latitude;
      const longitude = jsonData.longitude;

      const vegetationInfo = await getVegetationInfo(latitude, longitude);

      // Adicione as informações de vegetação ao objeto
      jsonData.vegetation = vegetationInfo;

      // Opcional: Exiba as informações
      console.log(`Informações de vegetação:`, vegetationInfo);

      // Salve as informações atualizadas no arquivo JSON
      fs.writeFile(jsonFileName, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Erro ao salvar o arquivo JSON:', err);
        } else {
          console.log('Informações de vegetação salvas com sucesso no arquivo JSON.');
        }
      });
    } catch (error) {
      console.error('Erro ao analisar o arquivo JSON:', error);
    }
  });
}

// Inicie o processo de leitura e processamento do arquivo JSON
processJSONData();


// Leitura dos arquivos JSON
const queimadasData = JSON.parse(fs.readFileSync('queimadas_com_clima.json', 'utf8'));
const mapaData = JSON.parse(fs.readFileSync('mapa_de_cobertura_vegetal.json', 'utf8'));

// Acesso aos registros de queimadas
const queimadasRegistros = queimadasData;

// Acesso às features do mapa
const features = mapaData.features;

// Função para verificar se as coordenadas estão dentro de uma feature
function isInsideFeature(latitude, longitude, feature) {
    const coordinates = feature.geometry.coordinates[0]; // Obtém as coordenadas da feature
    // Verifica se as coordenadas estão dentro da feature usando um algoritmo de ponto em polígono
    return isPointInPolygon(latitude, longitude, coordinates);
}

// Função para verificar se um ponto está dentro de um polígono
function isPointInPolygon(latitude, longitude, coordinates) {
    const n = coordinates.length;
    let inside = false;

    for (let i = 0; i < n; i++) {
        const [x1, y1] = coordinates[i];
        const [x2, y2] = coordinates[(i + 1) % n];

        if ((y1 <= latitude && latitude < y2) || (y2 <= latitude && latitude < y1)) {
            if (longitude < (x2 - x1) * (latitude - y1) / (y2 - y1) + x1) {
                inside = !inside;
            }
        }
    }

    return inside;
}

// Iteração sobre os registros de queimadas
for (const registro of queimadasRegistros) {
    const latitude = parseFloat(registro.latitude);
    const longitude = parseFloat(registro.longitude);

    // Inicialização da classe como null (não atribuída)
    registro.classe = null;

    // Iteração sobre as features do mapa
    for (const feature of features) {
        if (isInsideFeature(latitude, longitude, feature)) {
            // Atribuição da classe da feature ao registro
            registro.classe = feature.properties.classe;
            break;
        }
    }
}

// Agora, os registros de queimadas têm a classe correspondente com base na comparação com as features do mapa

// Impressão do primeiro registro para ver o resultado
console.log(queimadasRegistros[0]);

// Caminho para o arquivo de saída
const output_file = 'treinamento.json';

// Salve os dados do queimadas_registros no arquivo de saída
fs.writeFileSync(output_file, JSON.stringify(queimadas_registros, null, 2), 'utf8');

console.log(`Dados salvos com sucesso em ${output_file}`);

//Dados obtidos pelo INPE, exemplo:
//• 1.5 (ombrófila densa; alagados);
//• 1.7 (floresta decídua e sazonal);
//• 2.0 (floresta de contato; campinarana);,
//• 2.4 (savana arbórea; caatinga fechada);
//• 3.0 (savana; caatinga aberta);
//• 4.0 (agricultura);
//• 6.0 (pastagem; gramíneas). 

//Dados obtidos com base nos dados do INPE
//"Evergreen Needleleaf Forests" - Índice: 1.5 (ombrófila densa; alagados)
//"Evergreen Broadleaf Forests" - Índice: 1.7 (floresta perene de folhas largas)
//"Deciduous Needleleaf Forests" - Índice: 1.7 (floresta decídua de folhas longas)
//"Deciduous Broadleaf Forests" - Índice: 1.7 (floresta decídua de folhas largas)
//"Mixed Forests" - Índice: 1.6 (floresta mista, calculada como a média de 1.5 e 1.7)
//"Closed Shrublands" - Índice: 1.7 (arbustos fechados)
//"Open Shrublands" - Índice: 2.0 (arbustos abertos)
//"Woody Savannas" - Índice: 2.4 (savanna arbórea)
//"Savannas" - Índice: 3.0 (savanna)
//"Grasslands" - Índice: 6.0 (pastagem; gramíneas)
//"Permanent Wetlands" - Índice: 4.0 (terras úmidas permanentes)
//"Croplands" - Índice: 4.0 (terras agrícolas)
//"Urban and Built-up Lands" - Índice: 4.0 (áreas urbanas e construídas)
//"Cropland/Natural Vegetation Mosaics" - Índice: 4.0 (mosaicos de terras agrícolas e vegetação natural)
//"Permanent Snow and Ice" - Índice: 0.5 (neve e gelo permanentes)
//"Barren" - Índice: 0.5 (terras estéreis)
//"Water Bodies" - Índice: 0 (corpos d'água)
//"Unclassified" - Índice: null (não classificado)

// Tabela de índices
const indiceVegetation = {
    "Evergreen Needleleaf Forests": 1.5,
    "Evergreen Broadleaf Forests": 1.7,
    "Deciduous Needleleaf Forests": 1.7,
    "Deciduous Broadleaf Forests": 1.7,
    "Mixed Forests": 1.6,  // Média de 1.5 e 1.7
    "Closed Shrublands": 1.7,
    "Open Shrublands": 2.0,
    "Woody Savannas": 2.4,
    "Savannas": 3.0,
    "Grasslands": 6.0,
    "Permanent Wetlands": 4.0,
    "Croplands": 4.0,
    "Urban and Built-up Lands": 4.0,
    "Cropland/Natural Vegetation Mosaics": 4.0,
    "Permanent Snow and Ice": 0.5,
    "Barren": 0.5,
    "Water Bodies": 0,
    "Unclassified": null,
};

// Nome do arquivo JSON
const fileName = 'treinamento.json';

// Ler o arquivo JSON
fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        return;
    }

    try {
        // Converter o JSON em um objeto JavaScript
        const dataList = JSON.parse(data);

        // Verificar se a lista de dados não está vazia
        if (dataList.length > 0) {
            // Iterar por todos os objetos do JSON
            dataList.forEach((data) => {
                // Verificar se a chave 'classe' existe no objeto
                if (data.hasOwnProperty('classe')) {
                    const classe = data['classe'];

                    // Verificar se a classe existe na tabela de índices
                    if (indiceVegetation.hasOwnProperty(classe)) {
                        // Renomear o campo "id_vegetation" para "index_vegetation"
                        data['index_vegetation'] = indiceVegetation[classe];

                        // Remover o campo antigo "id_vegetation" (opcional)
                        if (data.hasOwnProperty('id_vegetation')) {
                            delete data['id_vegetation'];
                        }
                    }
                }
            });

            // Converter os dados atualizados de volta para JSON
            const updatedData = JSON.stringify(dataList, null, 4);

            // Escrever os dados atualizados de volta no arquivo JSON
            fs.writeFile(fileName, updatedData, 'utf8', (err) => {
                if (err) {
                    console.error('Erro ao escrever no arquivo JSON:', err);
                    return;
                }
                console.log('Campos renomeados com sucesso!');
            });
        } else {
            console.log('A lista de dados está vazia.');
        }
    } catch (error) {
        console.error('Erro ao processar o arquivo JSON:', error);
    }
});

*/
//Fim das coletas e tratamento dos dados

  const firebase = require('firebase/app');
  require('firebase/auth'); // Import the authentication module
  
  // Firebase configuration (same as yours)
  const firebaseConfig = {
    apiKey: "AIzaSyDQnJFQHwl_aN83M20XF7JIaAn5objbjjM",
    authDomain: "firefly-6703c.firebaseapp.com",
    projectId: "firefly-6703c",
    storageBucket: "firefly-6703c.appspot.com",
    messagingSenderId: "1031528441130",
    appId: "1:1031528441130:web:7d20bc89388b2cf3a7ea53",
    measurementId: "G-TC5GTZLNB9"
  };
  
  // Initialize Firebase
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  
  // Now, you can use firebaseApp for authentication and other Firebase services.
  
  const serviceAccount = {
    type: "service_account",
    project_id: "firefly-6703c",
    private_key_id: "038eb87466a5e466f85b7e082a752b4ad890fddf",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCeCiRZEd6vE3gi\n7Ta5u+qwESYvwrkmEbZvOBkvj6t2AYREc5JjfaM1N4/Vj81gHyUhn62n8Am+rI7e\n0fZt3YpHC5vsiPsIIfAxfTs8BhGRzwXdgGrItLGcwsnZkNH3O86ZetmYe/83yy/P\niVBwaGCfF63wBoe+w/uQ3E3U8+29NuLi5ltLnUMQooMEn7FZaFm7rKn3CdEfyeGn\nMamqzwWCChf/jvRygPB4A7z9au5sjFBhv/LXcLMUABCPnU8RQvaMoouNcpu4VqrR\nt1sSXa9UL2jS1kk4zTpvAoQtDUaQ2pR7YHIt5IxinazL/9kyYP7tIElU0Br3QHtf\nDxST8flbAgMBAAECggEARZG+XW0140kFRg65W/qifZ4W+shTu7PpZL1DrQGoH1rc\nkEt14hEQ8uDCEudqJ4meTVZe2gIbMBIDFIhF3Cg9cjfkjDPimbpi40428J3VRyPk\nd5TLrQ2J8DF5LKqJGzX7JOoE9pCDEVsC8W+HduwjuHTyjyo4wFvCloq8QmWcvoFE\nTMlx05klIqcpuckzZQJZIlhKRbjgNTIP5hIuNYQbiu/020OwHzN2ItS+lLMYFaAP\nTa6SnAqZpdfEynglY5REiHSDRWMyevyFxZwUWeQRTLpxjfB45YBUqws3eXKKMbF4\nWNo1f0+DXepknAiwCwU4PVpsb8cihshiAhgXO5cEmQKBgQDextzkCahAlfyNnlZZ\n65D8UaNYrT0gAtUVl0FCp6U4staP6s1S1U5kunAcHBkqWXYDGV9/M62JiGF5YHOH\nlqPc26KRab29NIEkDecEe0BHWUiSCMwNV2rTkg+oQ4RodI7NG/wB4m67HzSr2wg8\nWeJmKyyylLXTNwtURUk9HXzqwwKBgQC1m8DJCohXTvTObnJKsGi9jKqbsG5FxKFN\n4eSf5SLy9hA6yQmH7QT+luSi+9PtJO0g+77A80OLXUugE/PneIxQWd1lAErIFvRc\nKnO6l44JnX3AHjy8OFXLmQR+xwwQJr5GZViW2JqtTJHkpxv8KzwC1RqTuiXXBVao\nMc5iUfrdiQKBgHB1HK60vU2VKT9oLZkI1FC6+WVbVl7hbyWODDCUpk//31YZJnrp\nGMC6aLuX55A8Rtl7pnx03uZthR8bdFZ+0cs8yEz1fwWTCpnjtrnJagJabMrjS/Z0\nKYYR1nuPUbjVFf0uYkGlR1aIgzM5x2eHzETdCJxBe6PaxopMy5LhXty3AoGAAlgm\nXvIB3I6qXlfSpeAtGfVM5oGaitAE/QpjdyTwFI7Ums2pj9WhcN/lx6zUiYUmgnx9\nc+QwBQaJSWG4jk5iEU93qiwcywRw1xe9MrVuIfWkf+xkAFIB2YT6J+DN6Q92+VWp\nlRjqtj38zCTUGac9ORQjKbEHeAUbn0Q1U9OXF3ECgYBlvl6svOGBv8FXS8dWRDsG\n1ehZZ+4GpkAlZdvGZa+VjluGuOrNN8WbQCkgoaqM/64I+uWAnzwNTnUu3famT3/G\nczEoMfQpdwHnVmMeVsm3xjbD1PUY4hJ/HAKAVm5U88L9gE3JaND/v2P8ZUvwQB/j\npHb4KHJ2cfxH6ddEaFRGMg==\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-rkbvu@firefly-6703c.iam.gserviceaccount.com",
    client_id: "104983253204978791099",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-rkbvu%40firefly-6703c.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const db = admin.firestore();

async function Sendemail(){

// Caminho para o arquivo .env (ajuste o caminho conforme necessário)
const envFilePath = 'credentials.env';

// Função para ler o arquivo .env
function readEnvFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const envVariables = {};
    
    // Divide o arquivo em linhas e processa cada variável de ambiente
    const lines = data.split('\n');
    for (const line of lines) {
      const parts = line.split('=');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        envVariables[key] = value;
      }
    }
    
    return envVariables;
  } catch (err) {
    console.error('Erro ao ler o arquivo .env:', err);
    return {};
  }
}

// Lê o arquivo .env e obtém as variáveis de ambiente
const envVariables = readEnvFile(envFilePath);

// Agora você pode acessar as variáveis de ambiente diretamente
const gmailUser = envVariables.MAIL_USER;
const gmailPassword = envVariables.MAIL_PASSWORD;

// Use as variáveis em seu código
console.log(`Gmail User: ${gmailUser}`);
console.log(`Gmail Password: ${gmailPassword}`);

 const nodemailer = require('nodemailer');



 let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN
  }
});

let mailOptions = {
  from: 'tomerpacific@gmail.com',
  to: 'tomerpacific@gmail.com',
  subject: 'Nodemailer Project',
  text: 'Hi from your nodemailer project'
};
 
 // Enviar o e-mail
 transporter.sendMail(mailOptions, function(err, data) {
  if (err) {
    console.log("Error " + err);
  } else {
    console.log("Email sent successfully");
  }
});

// //Fim do envio de emails
}

Sendemail();
// Configurar o Express para servir arquivos estáticos do diretório 'src/index'
app.use('/map_complaint', express.static(path.join(__dirname, 'src/map_complaint')));

// Exemplo de rota para página mapa
// Rota para /map_complaint
app.get('/map_complaint', async (req, res) => {
  try {
    // Chame a função listarComplaints para obter todas as denúncias
    const complaints = await listarComplaints();

    
    
    // Renderize a página e passe as denúncias como dados para a página
    res.render('map_complaint/map_complaint', { complaints });
  } catch (error) {
    console.error('Erro ao buscar denúncias:', error);
    res.status(500).send('Ocorreu um erro ao buscar denúncias');
  }
});


// Função para listar todos os documentos e seus dados dentro da coleção 'complaints'
async function listarComplaints() {
  try {
    const complaintsRef = db.collection('complaints');
    
    // Consulta o Firestore para obter todos os documentos na coleção 'complaints'
    const snapshot = await complaintsRef.get();

    // Inicialize um array para armazenar os documentos e seus dados
    const allComplaints = [];

    // Itera sobre os documentos retornados
    snapshot.forEach((doc) => {
      allComplaints.push({
        id: doc.id,
        data: doc.data(), // Dados dentro do documento
      });
    });

    return allComplaints;
  } catch (error) {
    console.error("Erro ao listar as complaints:", error);
    throw error;
  }
}

// Exemplo de uso:
listarComplaints()
  .then((complaints) => {
    console.log("Todos os documentos e dados dentro de cada um deles:");
    complaints.forEach((complaint) => {
      console.log("Dados dentro do Documento:");
    });
  })
  .catch((error) => {
    console.error("Erro:", error);
  });




// Middleware to parse JSON requests
app.use(express.json());

const opencage = require('opencage-api-client');

opencage.geocode({ q: '3629 Yale Street, Vancouver, CA' }).then((data) => {
  console.log(data.results[0].geometry);
  // { "lat": 49.2909409, "lng": -123.024879 }
}).catch((error) => { console.warn(error.message) });

// Função para armazenar informações em um arquivo
function storeUserDataLocally(data) {
  fs.appendFile('offline_user_data.txt', JSON.stringify(data) + '\n', (err) => {
    if (err) {
      console.error('Erro ao armazenar dados do usuário localmente:', err);
    }
  });
}

// Rota para registro de usuário
app.post('/register', async (req, res) => {
  try {
    const username = req.body.Username;
    const email = req.body.email;

    // Verifique se o nome de usuário ou o email já existem no banco de dados
    const usernameQuery = await db.collection("users").where("username", "==", username).get();
    const emailQuery = await db.collection("users").where("email", "==", email).get();

    if (!usernameQuery.empty) {
      return res.redirect('/cadastro?error=Username already exists');
    }

    if (!emailQuery.empty) {
      return res.redirect('/cadastro?error=Email already exists');
    }

    // Se a conexão com a internet estiver disponível, prossiga com o registro do usuário
    if (isOnline) {
      const userJson = {
        username: req.body.Username,
        name: req.body.name,
        email: req.body.email,
        telefone: req.body.telefone,
        password: req.body.password,
        cep: req.body.cep,
        permissao: Cliente
      };

      const viaCepUrl = `https://viacep.com.br/ws/${userJson.cep}/json/`;

      try {
        const viaCepResponse = await axios.get(viaCepUrl);
        const viaCepData = viaCepResponse.data;

        if (!viaCepData.erro) {
          const bairro = viaCepData.bairro;
          const cidade = viaCepData.localidade;
          const estado = viaCepData.uf;

          const apiKey = '0da0f4ae5b5f43cab904a311b44414ea';
          const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            `${bairro}, ${cidade}, ${estado}`
          )}&key=${apiKey}`;

          const openCageResponse = await axios.get(openCageUrl);
          const openCageData = openCageResponse.data;

          if (openCageData.results.length > 0) {
            const location = openCageData.results[0].geometry;
            const latitude = location.lat;
            const longitude = location.lng;

            userJson.latitude = latitude;
            userJson.longitude = longitude;

            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

            await db.collection("users").doc(username).set(userJson);

            res.redirect('/?registrationSuccess=true');
          } else {
            console.error('Endereço não encontrado.');
          }
        } else {
          console.error('CEP não encontrado ou inválido.');
        }
      } catch (error) {
        console.error('Erro ao acessar a API ViaCEP ou OpenCage Data:', error);
      }
    } else {
      // Se a conexão estiver ausente, armazene temporariamente os dados do usuário em um arquivo local
      const userData = {
        username: req.body.Username,
        name: req.body.name,
        email: req.body.email,
        telefone: req.body.telefone,
        password: req.body.password,
        cep: req.body.cep
      };
      storeUserDataLocally(userData);
      res.redirect('/cadastro?registrationPending=true');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Ocorreu um erro durante o registro');
  }
});

// Função para registrar usuários quando a conexão for restaurada
async function handleOnline() {
  const offlineUserData = fs.readFileSync('offline_user_data.txt', 'utf8').split('\n');
  offlineUserData.forEach(async (line) => {
    if (line.trim() !== '') {
      const userData = JSON.parse(line);
      // Se a conexão com a Internet for restaurada, prossiga com o registro do usuário
      console.log('Dados do usuário registrados:', userData);
      // Agora você pode prosseguir com o registro do usuário no banco de dados
      // Inserir userData no banco de dados, por exemplo:
      // await db.collection("users").doc(userData.username).set(userData);
    }
  });
  fs.writeFileSync('offline_user_data.txt', ''); // Limpe o arquivo de dados offline
}

eventEmitter.on('online', handleOnline);



// Login route
// Importe o módulo express-session
const session = require('express-session');


// Configure o middleware express-session
app.use(session({
  secret: '123456', // Substitua pelo seu segredo
  resave: false,
  saveUninitialized: true,
}));

// Login route
app.post('/loginEnter', async (req, res) => {
  try {
    const usernameLogin = req.body.Username;
    const passwordLogin = req.body.password;

    // Check if the username and password match a user in the database
    const userQuery = await db.collection("users")
      .where("username", "==", usernameLogin)
      .where("password", "==", passwordLogin)
      .get();

    if (userQuery.empty) {
      // No matching user found, redirect with an error message
      return res.redirect('/login?error=Invalid username or password');
    }

    // Assuming there is only one user with the same username and password combination
    const user = userQuery.docs[0].data();
    
    // Set the session variables
    req.session.authenticated = true;
    req.session.username = usernameLogin;
    req.session.permissao = user.permissao; // Assuming 'permissao' is a field in your user document

    if (user.permissao === "Admin") {
      // If the user has 'Admin' permission, set adminLogado to true in the session
      req.session.adminLogado = true;
    }

    // Redirect to the main page with a success message
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.use('/ia-records', express.static(path.join(__dirname, 'src/IA-analyze')));

app.get('/ia-records', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'biodiversidade.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Erro ao ler biodiversidade.json:', err);
        res.status(500).send('Ocorreu um erro ao buscar os dados de biodiversidade');
        return;
      }

      const dadosBiodiversidade = JSON.parse(data);

      res.render('IA-analyze/IA-analyze', { dadosBiodiversidade });
    });
  } catch (error) {
    console.error('Erro ao buscar denúncias:', error);
    res.status(500).send('Ocorreu um erro ao buscar denúncias');
  }
});



// Função para cadastrar denúncias
async function cadastrarDenuncia(username, complaintData) {
  try {
    // Verifique se já existe um documento para o usuário
    const userDoc = await db.collection('complaints').doc(username).get();

    if (userDoc.exists) {
      // O documento do usuário já existe
      // Atualize o array 'complaints' com os novos dados
      await db.collection('complaints').doc(username).update({
        complaints: admin.firestore.FieldValue.arrayUnion(complaintData),
      });

      console.log('Denúncia cadastrada:', complaintData);
    } else {
      // O documento do usuário não existe, crie-o
      await db.collection('complaints').doc(username).set({
        complaints: [complaintData],
      });

      console.log('Documento do usuário criado e denúncia cadastrada:', complaintData);
    }
  } catch (error) {
    console.error('Erro durante o cadastro da denúncia:', error);
  }
}
//Inicio do algoritmo de cálculo de risco
// Configurar o Express para servir arquivos estáticos do diretório 'src/index'
app.use('/risc', express.static(path.join(__dirname, 'src/risc')));

// Rota para a página inicial
app.get('/risc', (req, res) => {
  const isAuthenticated = req.session.authenticated;


 // Todas as fórmulas
      // Rb(A_n=1,7) = valores definidos por instituições sérias
      // UR = [UR × (-0.006)] + 1,3
      // Ta = (Tmax × 0,02) + 0,4
      // RF = Rb × UR × Ta
  

    if(isAuthenticated === true){
      // Verificar se o navegador suporta a API de Geolocalização
      res.render('risc/risc');
        }else{
          res.redirect('/');
        }
});


// --
// Mapeamento entre classes e índices
const classToIndex = {
  "Evergreen Needleleaf Forests": 1.5,
  "Evergreen Broadleaf Forests": 1.7,
  "Deciduous Needleleaf Forests": 1.7,
  "Deciduous Broadleaf Forests": 1.7,
  "Mixed Forests": (1.5 + 1.7) / 2, // Média de 1.5 e 1.7
  "Closed Shrublands": 1.7,
  "Open Shrublands": 2.0,
  "Woody Savannas": 2.4,
  "Savannas": 3.0,
  "Grasslands": 6.0,
  "Permanent Wetlands": 4.0,
  "Croplands": 4.0,
  "Urban and Built-up Lands": 4.0,
  "Cropland/Natural Vegetation Mosaics": 4.0,
  "Permanent Snow and Ice": 0.5,
  "Barren": 0.5,
  "Water Bodies": 0,
  "Unclassified": null, // Use null em vez de None
};

// Função para ler o JSON de cobertura vegetal e encontrar a classe para uma coordenada
function findClassForCoordinate(latitude, longitude, jsonData) {
  for (const feature of jsonData.features) {
    const geometry = feature.geometry;
    if (isCoordinateInsideGeometry([longitude, latitude], geometry)) {
      return feature.properties.classe;
    }
  }
  return 'Classe não encontrada'; // Se a coordenada não pertencer a nenhuma geometria
}

// Função para verificar se uma coordenada está dentro de uma geometria
function isCoordinateInsideGeometry(coordinate, geometry) {
  // Implemente a lógica de verificação de ponto em polígono aqui
  // Retorne true se a coordenada estiver dentro da geometria, caso contrário, retorne false
  // Exemplo simplificado: verificando se a coordenada está dentro de um retângulo
  const [longitude, latitude] = coordinate;
  const { type, coordinates } = geometry;
  
  if (type === "Polygon") {
    // Verificar se a coordenada está dentro do polígono
    // Você precisará de uma lógica mais complexa para geometrias reais
    return isPointInPolygon([longitude, latitude], coordinates[0]);
  } else if (type === "MultiPolygon") {
    // Lógica semelhante para geometrias MultiPolygon
    for (const polygonCoordinates of coordinates) {
      if (isPointInPolygon([longitude, latitude], polygonCoordinates[0])) {
        return true;
      }
    }
  }
  return false;
}

// Função para verificar se uma coordenada está dentro de um polígono
function isPointInPolygon(point, polygon) {
  const x = point[0];
  const y = point[1];
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    
    if (intersect) {
      inside = !inside;
    }
  }
  
  return inside;
}

// Função para fazer uma solicitação de previsão climática
async function fetchForecastData(latitude, longitude) {
  const forecastUrl = `https://pro.openweathermap.org/data/2.5/forecast/climate?lat=${latitude}&lon=${longitude}&cnt=30&appid=909db2171a7383199a57cb791c612812`;

  try {
    const response = await axios.get(forecastUrl);
    const forecastData = response.data;

    // Faça algo com os dados de previsão, se necessário
    console.log('Dados de previsão:', forecastData);

    return forecastData;
  } catch (error) {
    throw error;
  }
}

// Função para calcular o valor com base nos dados de chuva
function calcularValorComChuva(data) {
  let resultado = 0.0;

  for (let i = 30; i >= 17; i--) {
    if (data.list[i] && data.list[i].rain) {
      const chuvaAtual = data.list[i].rain || 0;
      const chuvaAnterior = data.list[i - 1] && data.list[i - 1].rain ? data.list[i - 1].rain|| 0 : 0;
      resultado += chuvaAtual - chuvaAnterior;
    } else {
      // Se não houver dados de chuva, trate como 0
      resultado += 0.0;
    }
  }

  return resultado * -0.004;
}

// Função para calcular o valor sem dados de chuva
function calcularValorSemChuva(data) {
  let resultado = 0.0; // Inicialize com um número de ponto flutuante

  for (let i = 15; i >= 10; i--) {
    if (data.list[i] && data.list[i].rain) {
      const chuvaAtual = parseFloat(data.list[i].rain || 0); // Use parseFloat para obter um número de ponto flutuante
      const chuvaAnterior = data.list[i - 1] && data.list[i - 1].rain ? parseFloat(data.list[i - 1].rain || 0) : 0;
      resultado += chuvaAtual - chuvaAnterior;
    } else {
      // Se não houver dados de chuva, trate como 0.0
      resultado += 0.0;
    }
  }

  return resultado * -0.008;
}

// Função para calcular os valores restantes
function calcularValoresRestantes(data) {
  const multipliers = [-0.01, -0.02, -0.03, -0.04, -0.07, -0.14];
  let resultado = 0.0; // Inicialize com um número de ponto flutuante

  for (let i = 6; i >= 1; i--) {
    if (data.list[i] && data.list[i].rain) {
      const chuvaAtual = parseFloat(data.list[i].rain || 0); // Use parseFloat para obter um número de ponto flutuante
      resultado += chuvaAtual * multipliers[i - 1];
    } else {
      // Se não houver dados de chuva, trate como 0.0
      resultado += 0.0;
    }
  }

  return resultado;
}

// Função para obter dados da API

// Função para obter dados da API
async function getWeatherData(latitude, longitude) {
  try {
    // URL da API OpenWeatherMap (substitua os placeholders pelos valores reais)
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=909db2171a7383199a57cb791c612812`;

    // Faz a solicitação HTTP para obter os dados
    const response = await axios.get(url);

    // Verifica se a solicitação foi bem-sucedida
    if (response.status === 200) {
      // Extrai os valores de "sea_level" e "grnd_level" do objeto de resposta
      console.log(response);
      const { sea_level, grnd_level } = response.data.main;

      // Calcula a diferença entre sea_level e grnd_level
      const diferenca = sea_level - grnd_level;

      // Imprime o resultado
      console.log('Valor de sea_level:', sea_level);
      console.log('Valor de grnd_level:', grnd_level);
      console.log('Diferença entre sea_level e grnd_level:', diferenca);

      return diferenca;
    } else {
      console.log('Erro ao acessar a API:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Erro ao fazer a solicitação:', error);
    return null;
  }
}



// Configurar o Express para servir arquivos estáticos do diretório 'src/login'
app.use('/risc_myLocation', express.static(path.join(__dirname, 'src/risc')));
// Lê o arquivo JSON de cobertura vegetal
const jsonData = JSON.parse(fs.readFileSync('mapa_de_cobertura_vegetal.json', 'utf8'));

// Rota para a página de destino
app.get('/risc_myLocation', async (req, res) => {
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
 
  try {
    // Em seguida, faça a solicitação de previsão climática
    const forecastData = await fetchForecastData(latitude, longitude);

    // Encontre a classe com base nas coordenadas
    const classeEncontrada = findClassForCoordinate(latitude, longitude, jsonData);

    // Realize os cálculos com base nos dados de previsão e na classe encontrada
    const valorComChuva = calcularValorComChuva(forecastData);
    const valorSemChuva = calcularValorSemChuva(forecastData);
    const valoresRestantes = calcularValoresRestantes(forecastData);

    let PSE = valorComChuva*valorSemChuva*valoresRestantes;

    console.log(classeEncontrada);

    // Atribua um índice com base na classe encontrada
    const indiceAssociado = classToIndex[classeEncontrada];


  let umidade;
  let temperaturaMaxima;
// Certifique-se de que `forecastData` tenha dados válidos antes de acessar a última posição.
if (forecastData && forecastData.list && forecastData.list.length > 0) {
  const ultimaPosicao = forecastData.list[forecastData.list.length - 1]; // Última posição
   temperaturaMaxima = ultimaPosicao.temp.max;
   umidade = ultimaPosicao.humidity;

  console.log('Temperatura Máxima:', temperaturaMaxima);
  console.log('Umidade:', umidade);
} else {
  console.log('Os dados de previsão não estão disponíveis ou estão vazios.');
}

    //Risco de fogo básico para a previsão de 30 dias
    let RB = (0.8*(1+Math.sin(((indiceAssociado-1,7*PSE)-90)*(3.14/180))))/2

    //Fator de Umidade

    let constanteUR = -0.006;

    UR = ( umidade * (constanteUR))/ 1.3;

    //Fator de temperatura do ar

    let temperaturaConvertida = ((temperaturaMaxima-32)*5)/9
    FT = ( temperaturaConvertida * 0.02) + 0,4;

    //Risco de fogo observado

    let RF = RB * UR * FT;

    //Falta refinar
    
    //FLAT = (1 + abs(latitude[graus]) * 0,003)(3.8)
    const absLatitude = Math.abs(latitude);
    const FLAT = 1 + absLatitude * 0.003;

    //FELV = 1 + elevação[metros] * 0,00003

    const elevacao = getWeatherData(latitude,longitude);
    const FELV = 1 + elevacao * 0.00003;

    RFF = RF * FLAT * FELV;

    // Envie a resposta com os resultados dos cálculos, a classe e os dados de previsão
    /*
    res.send({
      forecast: forecastData,
      classe: classeEncontrada,
      indiceAssociado,
      valorComChuva,
      valorSemChuva,
      valoresRestantes,
    });
    */
    
 // Renderize a página com base na existência de umidade e temperaturaMaxima
 if (elevacao !== null) {
  // Renderize a página com os dados completos (RFF)
  res.render('risc/risc_myLocationRF', { RF });
} else {
  // Renderize a página com dados parciais ou nulos (RF)
  res.render('risc/risc_myLocationRFF', { RFF });
}

  } catch (error) {
    console.error('Erro ao fazer as solicitações:', error);
    res.status(500).send('Erro ao fazer as solicitações para as APIs.');
  }
});

// --

//Fim dos algoritmos

// Configurar o Express para servir arquivos estáticos do diretório 'src/login'
app.use('/lerUsuario', express.static(path.join(__dirname, 'src/profile')));

// Função para listar os dados do usuário
async function listarDadosUsuario(username) {
  try {
    const userRef = db.collection('users').doc(username); // Obtém o documento do usuário pelo username

    // Obtém os dados do usuário a partir do documento
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return userDoc.data(); // Retorna os dados do usuário
    } else {
      throw new Error('Usuário não encontrado');
    }
  } catch (error) {
    console.error("Erro ao obter os dados do usuário:", error);
    throw error;
  }
}

// Rota para a página de perfil
app.get('/lerUsuario', async (req, res) => {
  if (req.session.authenticated === true) {
    try {
      const username = req.session.username; // Obtém o nome de usuário da sessão

      // Chama a função para listar os dados do usuário
      const userData = await listarDadosUsuario(username);

      // Renderize a página EJS e passe os dados do usuário como uma variável
      res.render('profile/profile', { userData });
    } catch (error) {
      console.error("Erro ao obter os dados do usuário:", error);
      res.status(500).send("Erro ao obter os dados do usuário");
    }
  } else {
    res.redirect('/');
  }
});

// Rota para atualizar dados do usuário
app.post('/UpdateUser', async (req, res) => {
  if (req.session.authenticated === true) {
    try {
      // Extrair os dados do formulário
      const { username, name, email, telefone, password, cep } = req.body;

      // Se a conexão com a internet estiver disponível, atualize os dados do usuário diretamente
      if (isOnline) {
        // Obter o ID do usuário atual (assumindo que está em req.session.username)
        const docID = req.session.username;

        // Atualizar o documento no Firestore
        const userRef = db.collection('users').doc(docID);
        await userRef.update({
          username: username,
          name: name,
          email: email,
          telefone: telefone,
          password: password,
          cep: cep
        });

        // Redirecionar para a página após a atualização
        res.redirect('/lerUsuario');
      } else {
        // Se a conexão estiver ausente, armazene temporariamente os dados do usuário em um arquivo local
        const userData = {
          username: username,
          name: name,
          email: email,
          telefone: telefone,
          password: password,
          cep: cep
        };
        storeUserDataLocally(userData);
        res.redirect('/lerUsuario?updatePending=true');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      // Lide com o erro de alguma maneira (por exemplo, renderize uma página de erro)
    }
  } else {
    res.redirect('/');
  }
});

// Função para atualizar os dados do usuário quando a conexão for restaurada
async function handleOnline() {
  const offlineUserData = fs.readFileSync('offline_user_data.txt', 'utf8').split('\n');
  offlineUserData.forEach(async (line) => {
    if (line.trim() !== '') {
      const data = JSON.parse(line);
      // Se a conexão com a Internet for restaurada, atualize os dados do usuário
      // Insira aqui a lógica para atualizar os dados do usuário no servidor
      console.log('Dados do usuário atualizados:', data);
    }
  });
  fs.writeFileSync('offline_user_data.txt', ''); // Limpe o arquivo de dados offline
}

eventEmitter.on('online', handleOnline);

// Configurar o Express para servir arquivos estáticos do diretório 'src/dashboard'
app.use('/dashboard', express.static(path.join(__dirname, 'src/dashboard')));

// Configurar o Express para servir arquivos estáticos do diretório 'src/dashboard'
app.use('/complaints', express.static(path.join(__dirname, 'src/complaints')));





// Função para listar todos os documentos e seus dados dentro da coleção 'complaints' com autorizacao === false

async function listarComplaintsPendentes() {
  try {
    const complaintsRef = db.collection('complaints');
    
    // Consulta o Firestore para obter todos os documentos na coleção 'complaints'
    const snapshot = await complaintsRef.get();

    // Inicialize um array para armazenar os documentos e seus dados
    const allComplaints = [];

    // Itera sobre os documentos retornados
    snapshot.forEach((doc) => {
      const complaintsData = doc.data().complaints;
      complaintsData.forEach((complaint) => {
        allComplaints.push(complaint); // Adiciona diretamente o conteúdo de 'complaint' ao array
      });
    });

    return allComplaints;
  } catch (error) {
    console.error("Erro ao listar as complaints:", error);
    throw error;
  }
}


let hasComplaints = false; // Variável para rastrear se o usuário possui reclamações
app.get('/dashboard', async (req, res) => {
  if (req.session.authenticated === true) {
    // Verifique se o usuário é um administrador
    const isAdmin = req.session.adminLogado === true;

  
      let complaintsArray = [];
      let hasComplaints = false; // Inicialmente definido como falso

      if (isAdmin) {
        // Se for um administrador, liste todas as reclamações pendentes
        complaintsArray = await listarComplaintsPendentes();
        console.log(complaintsArray);
        if (complaintsArray.length > 0) {
          hasComplaints = true;
        }
        res.render('dashboard/dashboard_adm', { complaints: complaintsArray, hasComplaints });
    } else {
      // ID do usuário que fez login (você pode obtê-lo a partir do objeto `req` ou da sessão)
      const userId = String(req.session.username);
      
      // Referência ao documento do usuário na coleção "complaints" com base no nome de usuário
      const userDocRef = db.collection('complaints').doc(userId);
      
      try {
        const userDoc = await userDocRef.get();
        
        
        if (userDoc.exists) {
          // Acessando o campo "complaints" dentro do documento do usuário
          const complaintsArray = userDoc.data().complaints || [];
          console.log('Dados das reclamações:', complaintsArray);
          
          if (complaintsArray.length > 0) {
            hasComplaints = true; // O usuário possui reclamações
          }
          
          // Renderize sua página de dashboard ou envie os dados como resposta JSON
          res.render('dashboard/dashboard', { complaints: complaintsArray, hasComplaints });
        } else {
          // Renderize sua página de dashboard com hasComplaints igual a false
          res.render('dashboard/dashboard', { hasComplaints });
        }
      } catch (error) {
        console.error('Erro ao buscar reclamações:', error);
        res.status(500).send('Erro ao buscar reclamações');
      }
    }
  } else {
    res.redirect('/login');
  }
});

app.get('/complaints', async (req, res) => {
  if (req.session.authenticated === true) {
    // ID do usuário que fez login (você pode obtê-lo a partir do objeto `req` ou da sessão)
    res.render('complaints/complaints');
 
  } else {
    res.redirect('/login');
  }
});

// Rota para cadastrar denúncias
app.post('/cadastraDenuncia', async (req, res) => {
  try {
    if (!req.session.authenticated) {
      return res.status(401).send('Unauthorized');
    }

    const base64Image = req.body.imageBase64;

    // Verifique se a string base64 começa com um cabeçalho de imagem válido
    const supportedImageHeaders = ['data:image/jpeg;base64,', 'data:image/jpg;base64,', 'data:image/png;base64,'];
    const isValidImage = supportedImageHeaders.some((header) => base64Image.startsWith(header));

    if (!isValidImage) {
      return res.status(400).send('Invalid image format');
    }

    const statusComplaint = false;

    // Defina os dados da denúncia
    const complaintData = {
      title: req.body.title,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      usernameUser_complaint: req.session.username,
      imageBase64: req.body.imageBase64,
      dataBegin: req.body.dataBegin,
      dataFinal: req.body.dateFinal,
      damage: req.body.damage,
      description: req.body.description,
      autorizacao: statusComplaint // Define o status com base na porcentagem de similaridade
    };

    // Se a conexão com a internet estiver disponível, cadastre a denúncia diretamente
    if (isOnline) {
      const username = req.session.username; // Substitua pelo nome de usuário correto
      await cadastrarDenuncia(username, complaintData);
      res.redirect('/complaints?registrationSuccess=true');
    } else {
      // Se a conexão estiver ausente, armazene temporariamente a denúncia em um arquivo local
      storeDataLocally(complaintData);
      res.redirect('/complaints?registrationPending=true');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred during registration');
  }
});

// Função para cadastrar denúncias quando a conexão for restaurada
async function handleOnline() {
  const offlineData = fs.readFileSync('offline_data.txt', 'utf8').split('\n');
  offlineData.forEach(async (line) => {
    if (line.trim() !== '') {
      const data = JSON.parse(line);
      await cadastrarDenuncia(data); // Cadastre as denúncias pendentes
    }
  });
  fs.writeFileSync('offline_data.txt', ''); // Limpe o arquivo de dados offline
}

eventEmitter.on('online', handleOnline);

// Iniciar a verificação da conexão
checkInternetConnection();

// Configurar o Express para servir arquivos estáticos do diretório 'src/profile'
app.use('/profile', express.static(path.join(__dirname, 'src/profile')));

// Exemplo de rota para página mapa
app.get('/profile', (req, res) => {
  res.render('profile/profile');
});

// Configurar o Express para servir arquivos estáticos do diretório 'src/index'
app.use('/', express.static(path.join(__dirname, 'src/index')));

// Configurar o Express para servir arquivos estáticos do diretório 'src/login'
app.use('/login', express.static(path.join(__dirname, 'src/login')));

// Configurar o Express para servir arquivos estáticos do diretório 'src/cadastro'
app.use('/cadastro', express.static(path.join(__dirname, 'src/cadastro')));

// Configurar o Express para servir arquivos estáticos do diretório 'src/mapa'
app.use('/mapa', express.static(path.join(__dirname, 'src/mapa')));

// Configurar o Express para servir arquivos estáticos do diretório 'src/mapa'
app.use('/tutorials', express.static(path.join(__dirname, 'src/tutorials')));

// Exemplo de rota para a página de cadastro
app.get('/tutorials', (req, res) => {
  res.render('tutorials/tutorials');
});

// Exemplo de rota para a página de cadastro
app.get('/cadastro', (req, res) => {
  res.render('cadastro/cadastro');
});

// Exemplo de rota para página login
app.get('/login', (req, res) => {
  res.render('login/login');
});

// Exemplo de rota para página login
app.get('/', (req, res) => {

  const isAuthenticated = req.session.authenticated; // Supondo que você está usando autenticação com Passport.js, por exemplo
  res.render('index/index', {isAuthenticated});
});


const API_KEYMapa = 'b46b1aa319fc4ba063f3ee989f996d6b';
const AREA_API_URLMapa = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${API_KEYMapa}/VIIRS_NOAA20_NRT/world/2`;

async function getFireDataMapa() {
  try {
    const response = await axios.get(AREA_API_URLMapa);
    return response.data.split('\n').map((line) => line.split(','));
  } catch (error) {
    console.error('Erro ao obter dados de queimadas:', error);
    throw error;
  }
}

function transformDataMapa(data) {
  const header = data[0];
  return data.slice(1).map((item) => {
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = item[i];
    }
    return obj;
  });
}

function saveFireDataToFileMapa(data) {
  const jsonData = JSON.stringify(data, null, 2);
    // Exclui o arquivo 'biodiversidade.json' se ele existir
    if (fs.existsSync('dados_de_queimadasMapa.json')) {
      fs.unlinkSync('dados_de_queimadasMapa.json');
      console.log('Arquivo dados_de_queimadasMapa.json excluído');
    }
  fs.writeFileSync('dados_de_queimadasMapa.json', jsonData, 'utf-8');
  console.log('Dados de queimadas salvos em dados_de_queimadasMapa.json');
}

function readFireDataFromFileMapa() {
  try {
    const jsonData = fs.readFileSync('dados_de_queimadasMapa.json', 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Erro ao ler o arquivo de dados de queimadas:', error);
    throw error;
  }
}

// Exemplo de rota para página mapa
app.get('/mapa', async (req, res) => {
  try {

    getFireDataMapa()
  .then((data) => {
    const transformedData = transformDataMapa(data);
    saveFireDataToFileMapa(transformedData);
  })
  .catch((error) => {
    console.error('Erro:', error);
  });

    // Chamar a função para obter dados de queimadas
    const fireData = await getFireDataMap();
    // Renderizar a página 'mapa.ejs' e passar os dados para o script no lado do cliente
    const isAuthenticated = req.session.authenticated; // Supondo que você está usando autenticação com Passport.js, por exemplo
    res.render('mapa/mapa', { fireData, isAuthenticated });
  } catch (error) {
    console.error('Erro ao obter dados de queimadas:', error);
    res.status(500).send('Erro ao obter dados de queimadas');
  }
});

// Função para obter dados de queimadas a partir de um arquivo JSON local
async function getFireDataMap() {
  try {
    // Faça a leitura do arquivo JSON local (certifique-se de que o arquivo existe)
    const fs = require('fs');
    const data = fs.readFileSync('dados_de_queimadasMapa.json', 'utf8');

    // Parseie os dados JSON
    const fireData = JSON.parse(data);

    return fireData;
  } catch (error) {
    console.error('Erro ao obter dados de queimadas:', error);
    throw error;
  }
}

app.get('/atualizar-complaint', async (req, res) => {
  const complaintId = req.query.id;
  const usernameComplaint = req.query.username;
  console.log(complaintId, usernameComplaint);

  try {
    const complaintsRef = db.collection('complaints').doc(usernameComplaint);
    const userDoc = await complaintsRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('Usuário não encontrado.');
    }

    const complaints = userDoc.data().complaints;
    
    // Encontre o índice da reclamação com o ID correspondente
    const complaintIndex = complaints.findIndex((complaint) => complaint.id === complaintId);

    if (complaintIndex === -1) {
      return res.status(404).send('Reclamação não encontrada.');
    }

    // Atualize a autorização da reclamação no array
    complaints[complaintIndex].autorizacao = true;

    // Atualize o documento do usuário com as reclamações modificadas
    await complaintsRef.update({ complaints });

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Erro ao autenticar a reclamação:', error);
    res.status(500).send('Erro ao autenticar a reclamação.');
  }
});


app.get('/excluir-complaint', async (req, res) => {
  const complaintId = req.query.id;
  const usernameComplaint = req.query.username;
  console.log(complaintId, usernameComplaint);

  try {
    const complaintsRef = db.collection('complaints').doc(usernameComplaint);
    const userDoc = await complaintsRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('Usuário não encontrado.');
    }

    const complaints = userDoc.data().complaints;
    
    // Encontre o índice da reclamação com o ID correspondente
    const complaintIndex = complaints.findIndex((complaint) => complaint.id === complaintId);

    if (complaintIndex === -1) {
      return res.status(404).send('Reclamação não encontrada.');
    }

    // Remova a reclamação do array
    complaints.splice(complaintIndex, 1);

    // Atualize o documento do usuário sem a reclamação excluída
    await complaintsRef.update({ complaints });

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Erro ao excluir a reclamação:', error);
    res.status(500).send('Erro ao excluir a reclamação.');
  }
});



//Rodei "ln -s /home/firefly-project/apps_nodejs/app/src/index/images/ images"



const port = process.env.PORT_APP || 21065;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/logout', (req,res) => {
  req.session.authenticated = false;
  if(req.session.adminLogado === true){
    req.session.adminLogado = false;np
  }
  res.redirect('/');
});


app.get('/logout', (req,res) => {
  req.session.authenticated = false;
  if(req.session.adminLogado === true){
    req.session.adminLogado = false;np
  }
  res.redirect('/');
});

const API_KEY = 'b46b1aa319fc4ba063f3ee989f996d6b';
const AREA_API_URL = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${API_KEY}/VIIRS_NOAA20_NRT/world/2`;

async function getFireData() {
  try {
    const response = await axios.get(AREA_API_URL);
    return response.data.split('\n').map((line) => line.split(','));
  } catch (error) {
    console.error('Erro ao obter dados de queimadas:', error);
    throw error;
  }
}

function transformData(data) {
  const header = data[0];
  return data.slice(1).map((item) => {
    const obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = item[i];
    }
    return obj;
  });
}

function saveFireDataToFile(data) {
  const jsonData = JSON.stringify(data, null, 2);
    // Exclui o arquivo 'biodiversidade.json' se ele existir
    if (fs.existsSync('dados_de_queimadas.json')) {
      fs.unlinkSync('dados_de_queimadas.json');
      console.log('Arquivo dados_de_queimadas.json excluído');
    }
  fs.writeFileSync('dados_de_queimadas.json', jsonData, 'utf-8');
  console.log('Dados de queimadas salvos em dados_de_queimadas.json');
}

function readFireDataFromFile() {
  try {
    const jsonData = fs.readFileSync('dados_de_queimadas.json', 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Erro ao ler o arquivo de dados de queimadas:', error);
    throw error;
  }
}

async function requestGBIFWithCoordinates(latitude, longitude) {
  const GBIF_API_URL = `https://api.gbif.org/v1/occurrence/search?year=2023&geoDistance=${latitude},${longitude},5km`;
  return axios.get(GBIF_API_URL);
}

function saveBiodiversityDataToFile(data) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync('biodiversidade.json', jsonData, 'utf-8');
}

if (!fs.existsSync('biodiversidade.json')) {
  fs.writeFileSync('biodiversidade.json', '[]', 'utf-8');
}

let processedCoordinates = 0; // Variável de controle para rastrear as coordenadas processadas

async function fetchDataAndSave() {
  // Exclui o arquivo 'biodiversidade.json' se ele existir
  if (fs.existsSync('biodiversidade.json')) {
    fs.unlinkSync('biodiversidade.json');
    console.log('Arquivo biodiversidade.json excluído');
  }
  const fireData = readFireDataFromFile();
  const biodiversityData = [];

  for (const { latitude, longitude } of fireData) {
    try {
      const response = await requestGBIFWithCoordinates(latitude, longitude);
      const count = response.data.count;

      if (count > 0) {
        const gbifData = response.data.results[0];
        biodiversityData.push({
          latitude,
          longitude,
          ...gbifData
        });

        // Verifica se o arquivo 'biodiversidade.json' existe antes de salvar os dados
        if (!fs.existsSync('biodiversidade.json')) {
          fs.writeFileSync('biodiversidade.json', '[]', 'utf-8');
        }

        saveBiodiversityDataToFile(biodiversityData);
      } 
    } catch (error) {
      console.error(`Erro ao fazer solicitação à API GBIF para a localização (${latitude}, ${longitude}):`, error);
    } finally {
      processedCoordinates++; // Incrementa o contador de coordenadas processadas
    }
  }

  if (processedCoordinates === fireData.length) {
    // Se todas as coordenadas foram processadas, encerra a função
    console.log('Todas as coordenadas foram processadas. Encerrando a execução.');
  }
}

setInterval(fetchDataAndSave, 14 * 60 * 60 * 1000);

setInterval(() => {
  getFireData()
    .then((data) => {
      const transformedData = transformData(data);
      saveFireDataToFile(transformedData);
    })
    .catch((error) => {
      console.error('Erro:', error);
    });
}, 13 * 60 * 60 * 1000);