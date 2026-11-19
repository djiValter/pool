# Mergulhos Mundiais

Aplicação móvel do Pool, feita em React Native com Expo e TypeScript. Usa o mesmo backend FastAPI do site para consultar horários ocupados e criar reservas.

## Testar no Android

1. No Fedora, abre o terminal na pasta `pool-mobile` com Node.js 20.19.4 ou superior.
2. Instala as dependências e inicia o Expo.

   ```bash
   npm ci
   npm start
   ```

3. Liga o telemóvel e o computador à mesma rede Wi-Fi. Abre o Expo Go compatível com SDK 54 e lê o QR code. A versão compatível para Android está disponível em [Expo Go](https://expo.dev/go).

## API

A app usa `https://pool-szew.onrender.com` por defeito. Para ligar a outra instância, copia `.env.example` para `.env`, altera `EXPO_PUBLIC_API_URL` e reinicia o Expo. Se o FastAPI estiver no teu computador, usa o IP local do computador no endereço da API, porque `localhost` no telemóvel aponta para o próprio telemóvel.

O calendário consulta `GET /agendamentos/ocupados`. O formulário usa `POST /agendamentos/` e abre o ecrã de confirmação depois de a API aceitar a reserva. O botão de WhatsApp abre uma mensagem pronta a enviar para o contacto indicado. A notificação por e-mail é responsabilidade do backend.

## Verificação

```bash
npm run typecheck
npx expo export --platform android --platform ios
```
