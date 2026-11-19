import { Alert, Linking, Text, View } from "react-native";
import { dataLegivel, dinheiro, linkWhatsApp, type Reserva } from "../../reservas";
import { Botao } from "../ui/Botao";
import { s } from "../ui/tema";

export function Confirmacao({ reserva, voltar }: { reserva: Reserva; voltar: () => void }) {
  return (
      <>
        <Text style={s.titulo}>Reserva confirmada</Text>
        <View style={s.cartao}>
          <Text style={s.subtitulo}>Reserva #{reserva.id}</Text>
          <Text style={s.texto}>{dataLegivel(reserva.data)} às {reserva.hora.slice(0, 5)}</Text>
          <Text style={s.texto}>{reserva.numero_pessoas} pessoa(s) · {reserva.tipo}</Text>
          <Text style={s.rotulo}>{dinheiro(Number(reserva.total))}</Text>
        </View>
        <Botao texto="Abrir confirmação no WhatsApp" acao={() => {
          void Linking.openURL(linkWhatsApp(reserva)).catch(() => Alert.alert("WhatsApp", "Não foi possível abrir a confirmação."));
        }} />
        <Botao texto="Voltar ao calendário" variante="secundario" acao={voltar} />
      </>
  );
}
