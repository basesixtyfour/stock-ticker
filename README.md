# Stock Ticker - Real-Time WebSocket Application

A real-time stock price monitoring application built with Node.js, WebSockets, STOMP protocol, and RabbitMQ message queuing. This application allows users to subscribe to stock symbols and receive live price updates through a web interface.

## 🏗️ Architecture

The application consists of three main components:

- **WebSocket Server** (`server.js`) - Handles WebSocket connections and STOMP protocol
- **Stock Data Daemon** (`daemon.js`) - Fetches real-time stock data from Yahoo Finance
- **Web Client** (`client.html`) - Browser-based interface for subscribing to stocks
- **STOMP Helper** (`stomp_helper.js`) - Utility for STOMP protocol frame processing

## 🚀 Features

- **Real-time Stock Updates**: Live price updates every 10 seconds
- **WebSocket Communication**: Efficient bidirectional communication using STOMP protocol
- **Message Queuing**: RabbitMQ for reliable message delivery between components
- **Responsive UI**: Bootstrap-based interface with real-time status indicators
- **Multiple Stock Support**: Subscribe to multiple stock symbols simultaneously
- **Connection Management**: Automatic reconnection and status monitoring

## 📋 Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- Modern web browser with WebSocket support

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-ticker
   ```

2. **Install dependencies**
   ```bash
   npm install ws uuid amqp yahoo-finance2
   ```

3. **Start RabbitMQ using Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 🚀 Usage

1. **Start the WebSocket server**
   ```bash
   node server.js
   ```
   The server will start on port 8181.

2. **Start the stock data daemon** (in a separate terminal)
   ```bash
   node daemon.js
   ```

3. **Open the web client**
   - Open `client.html` in your web browser
   - Or serve it using a local web server:
     ```bash
     python -m http.server 8000
     # Then navigate to http://localhost:8000/client.html
     ```

4. **Use the application**
   - Enter a stock symbol (e.g., AAPL, GOOGL, MSFT)
   - Click "Add" to subscribe to real-time updates
   - Monitor price changes with color-coded indicators
   - Remove stocks using the "Remove" button

## 🔧 Configuration

### RabbitMQ Settings
The application uses the following RabbitMQ configuration:
- **Host**: localhost:5672
- **Username**: websockets
- **Password**: rabbitmq
- **Management UI**: http://localhost:15672

### WebSocket Server
- **Port**: 8181
- **Protocol**: STOMP v1.0

## 📁 Project Structure

```
stock-ticker/
├── server.js          # WebSocket server with STOMP protocol
├── daemon.js          # Stock data fetcher daemon
├── client.html        # Web client interface
├── stomp_helper.js    # STOMP protocol utilities
├── docker-compose.yml # RabbitMQ container configuration
└── README.md          # This file
```

## 🔄 Data Flow

1. **Client Subscription**: User adds a stock symbol via the web interface
2. **WebSocket Connection**: Client establishes STOMP connection to server
3. **Queue Subscription**: Server subscribes to stock updates for the symbol
4. **Periodic Updates**: Every 10 seconds, server requests stock data
5. **Data Fetching**: Daemon fetches real-time data from Yahoo Finance
6. **Message Publishing**: Daemon publishes results to RabbitMQ
7. **Client Updates**: Server forwards updates to subscribed clients
8. **UI Refresh**: Client updates the display with new prices

## 🛡️ Security Considerations

⚠️ **Important Security Notes**:

- **No Authentication**: The current implementation lacks user authentication
- **No Input Validation**: Stock symbols are not validated before processing
- **Hardcoded Credentials**: RabbitMQ credentials are hardcoded in the source
- **No Rate Limiting**: No protection against excessive API calls
- **CORS Issues**: WebSocket connections may be blocked by CORS policies

### Recommended Security Improvements

1. **Implement Authentication**: Add user login/session management
2. **Input Sanitization**: Validate and sanitize stock symbol inputs
3. **Environment Variables**: Move credentials to environment variables
4. **Rate Limiting**: Implement API rate limiting
5. **HTTPS/WSS**: Use secure connections in production
6. **Input Validation**: Add comprehensive input validation

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Ensure RabbitMQ is running: `docker-compose ps`
   - Check if port 8181 is available
   - Verify WebSocket support in browser

2. **No Stock Data**
   - Check if daemon.js is running
   - Verify Yahoo Finance API access
   - Check RabbitMQ management UI for message flow

3. **WebSocket Errors**
   - Ensure server.js is running
   - Check browser console for errors
   - Verify STOMP protocol support

### Debug Mode

Enable debug logging by setting environment variables:
```bash
DEBUG=* node server.js
DEBUG=* node daemon.js
```

## 📊 Monitoring

- **RabbitMQ Management**: http://localhost:15672 (websockets/rabbitmq)
- **WebSocket Connections**: Monitor via server console output
- **Stock Data Flow**: Check daemon console for API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Dependencies

- **ws**: WebSocket library for Node.js
- **uuid**: UUID generation
- **amqp**: RabbitMQ client for Node.js
- **yahoo-finance2**: Yahoo Finance API client
- **Bootstrap**: CSS framework for UI
- **STOMP.js**: STOMP protocol client for browsers

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Historical price charts
- [ ] Price alerts and notifications
- [ ] Portfolio management features
- [ ] Mobile-responsive design improvements
- [ ] API rate limiting and caching
- [ ] Docker containerization for the entire application
- [ ] Unit and integration tests
- [ ] Configuration management
- [ ] Logging and monitoring improvements
