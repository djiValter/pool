import { ActivityIndicator, Alert, ImageBackground, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { dataISO, dataLegivel } from "../../reservas";
import type { useCalendario } from "../reservas/useCalendario";
import { Botao } from "../ui/Botao";
import { cores, s } from "../ui/tema";

const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const contacto = "+258 84 410 1647";
const estados = {
  livre: { fundo: "#DFF4EA", texto: "#07594F" },
  parcial: { fundo: "#FFF0CF", texto: "#805019" },
  privado: { fundo: "#FCE5E5", texto: "#8B3644" },
  fechado: { fundo: "#F3F6F5", texto: "#526764" },
};

export function Calendario({ calendario, data, escolherData }: {
  calendario: ReturnType<typeof useCalendario>;
  data: string;
  escolherData: (data: string) => void;
}) {
  const { mes, hoje, ano, indiceMes, dias, horarios, carga, erroCalendario, mudarMes, actualizar } = calendario;
  const primeiro = (mes.getUTCDay() + 6) % 7;
  const tituloMes = mes.toLocaleDateString("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" });
  const mesAnteriorBloqueado = dataISO(mes).slice(0, 7) <= hoje.slice(0, 7);
  const calendarioPronto = !carga && !erroCalendario;
  const datas = Array.from({ length: dias }, (_, indice) => {
    const numero = indice + 1;
    const dia = new Date(Date.UTC(ano, indiceMes, numero));
    const iso = dataISO(dia);
    const reservas = horarios.filter(item => item.data === iso);
    const podeReservar = iso >= hoje && [0, 6].includes(dia.getUTCDay());
    let estado: keyof typeof estados = "fechado";
    if (reservas.some(item => item.tipo === "privado")) estado = "privado";
    else if (podeReservar && calendarioPronto) estado = reservas.length ? "parcial" : "livre";

    return { numero, dia, iso, estado, quantidade: reservas.length };
  });
  const proximaData = datas.find(item => item.estado === "livre" || item.estado === "parcial");

  return (
    <>
      <ImageBackground source={require("../../assets/piscina.jpeg")} style={ui.hero} imageStyle={ui.foto}>
        <View style={ui.heroConteudo}>
          <Text style={ui.heroTitulo} accessibilityRole="header">O teu próximo mergulho</Text>
          <Text style={ui.heroHorario}>Sábados e domingos · 12h–20h</Text>
        </View>
      </ImageBackground>

      <View style={ui.cartao}>
        <View style={ui.cabecalho}>
          <View style={ui.cabecalhoTexto}>
            <Text style={ui.titulo} accessibilityRole="header">Escolhe o teu dia</Text>
            <Text style={s.texto}>Toca numa data para iniciar a reserva.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Actualizar horários"
            accessibilityState={{ disabled: carga, busy: carga }}
            onPress={actualizar} disabled={carga}
            style={({ pressed }) => [ui.controlo, pressed && ui.pressionado]}>
            {carga ? <ActivityIndicator color={cores.verde} size="small" /> : <Text style={ui.icone}>↻</Text>}
          </Pressable>
        </View>

        <View style={ui.mes}>
          <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior"
            accessibilityState={{ disabled: mesAnteriorBloqueado }} disabled={mesAnteriorBloqueado}
            onPress={() => mudarMes(-1)}
            style={({ pressed }) => [ui.controlo, mesAnteriorBloqueado && ui.controloInactivo, pressed && ui.pressionado]}>
            <Text style={ui.icone}>‹</Text>
          </Pressable>
          <Text accessibilityLiveRegion="polite" style={ui.tituloMes}>{tituloMes}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Mês seguinte"
            onPress={() => mudarMes(1)}
            style={({ pressed }) => [ui.controlo, pressed && ui.pressionado]}>
            <Text style={ui.icone}>›</Text>
          </Pressable>
        </View>

        <View style={ui.grelha}>
          {diasSemana.map(dia => <Text key={dia} style={[ui.coluna, ui.diaSemana]}>{dia}</Text>)}
          {Array.from({ length: primeiro }, (_, indice) => <View key={indice} style={ui.coluna} />)}
          {datas.map(({ iso, numero, estado, quantidade }) => {
            const seleccionada = iso === data;
            const indisponivel = estado === "fechado" || estado === "privado";
            const detalhe = estado === "privado" ? "dia privado"
              : estado === "parcial" ? `${quantidade} horários reservados`
              : estado === "livre" ? "sem reservas" : "indisponível";
            const cor = estados[estado];
            return (
              <View key={iso} style={ui.coluna}>
                <Pressable accessibilityRole="button" accessibilityLabel={`${dataLegivel(iso)}, ${detalhe}`}
                  accessibilityState={{ selected: seleccionada, disabled: indisponivel }}
                  disabled={indisponivel} onPress={() => escolherData(iso)}
                  style={({ pressed }) => [
                    ui.dia, { backgroundColor: cor.fundo },
                    seleccionada && ui.diaSeleccionado, pressed && ui.pressionado,
                  ]}>
                  <Text style={[ui.numero, { color: cor.texto }]}>{numero}</Text>
                  <View style={[ui.marcaDia, estado !== "fechado" && { backgroundColor: cor.texto }]} />
                </Pressable>
              </View>
            );
          })}
        </View>

        {carga && <Text style={s.texto} accessibilityLiveRegion="polite">A carregar horários…</Text>}
        {!!erroCalendario && <Text style={s.erro} accessibilityLiveRegion="polite">{erroCalendario}</Text>}
        {calendarioPronto && (
          <View style={ui.legenda}>
            <Legenda cor={estados.livre.texto} texto="Sem reservas" />
            <Legenda cor={estados.parcial.texto} texto="Com reservas" />
            <Legenda cor={estados.privado.texto} texto="Dia privado" />
          </View>
        )}
      </View>

      {calendarioPronto && (
        <View style={ui.sugestao}>
          <Text style={ui.sugestaoTitulo}>{proximaData ? "Próxima data para reservar" : "Sem datas para reservar neste mês"}</Text>
          {proximaData && <Text style={ui.sugestaoData}>{proximaData.dia.toLocaleDateString("pt-PT", {
            weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
          })}</Text>}
          <Botao
            texto={proximaData ? "Escolher esta data" : "Ver mês seguinte"}
            variante="destaque"
            acao={() => proximaData ? escolherData(proximaData.iso) : mudarMes(1)}
          />
        </View>
      )}
      <View style={ui.cartao}>
        <Text style={ui.titulo} accessibilityRole="header">Contacto</Text>
        <Text style={s.texto}>Tens dúvidas sobre a tua reserva?</Text>
        <Botao
          texto={`Ligar · ${contacto}`}
          variante="secundario"
          acao={() => {
            void Linking.openURL(`tel:${contacto.replace(/ /g, "")}`).catch(() => {
              Alert.alert("Contacto", `Podes ligar para ${contacto}.`);
            });
          }}
        />
      </View>
    </>
  );
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <View style={ui.itemLegenda}>
      <View style={[ui.marcaDia, { backgroundColor: cor }]} />
      <Text style={ui.textoLegenda}>{texto}</Text>
    </View>
  );
}

const ui = StyleSheet.create({
  hero: { minHeight: 215, justifyContent: "flex-end", overflow: "hidden", borderRadius: 24, backgroundColor: "#103D3D" },
  foto: { resizeMode: "cover" },
  heroConteudo: { padding: 19, gap: 7, backgroundColor: "#062C30CC" },
  heroTitulo: { color: "#FFFFFF", fontSize: 28, lineHeight: 33, fontWeight: "800", letterSpacing: -0.7 },
  heroHorario: { color: "#E1F8EE", fontSize: 14, fontWeight: "700" },
  cartao: { backgroundColor: "#FFFFFF", padding: 12, gap: 12, borderRadius: 24, borderWidth: 1, borderColor: cores.linha },
  cabecalho: { flexDirection: "row", alignItems: "center", gap: 8 },
  cabecalhoTexto: { flex: 1, gap: 3 },
  titulo: { color: cores.escuro, fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  controlo: { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center", borderRadius: 13, backgroundColor: "#E7F3ED" },
  controloInactivo: { opacity: 0.4 },
  pressionado: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  icone: { color: cores.verde, fontWeight: "700", fontSize: 23 },
  mes: { flexDirection: "row", alignItems: "center", gap: 6 },
  tituloMes: { color: cores.escuro, flex: 1, textAlign: "center", textTransform: "capitalize", fontSize: 16, fontWeight: "800" },
  grelha: { flexDirection: "row", flexWrap: "wrap" },
  coluna: { width: "14.28%", padding: 2 },
  diaSemana: { paddingVertical: 6, textAlign: "center", color: cores.secundario, fontSize: 11, fontWeight: "700" },
  dia: { minHeight: 46, justifyContent: "center", alignItems: "center", gap: 3, borderRadius: 11, borderWidth: 1, borderColor: "transparent" },
  diaSeleccionado: { borderColor: cores.verde },
  numero: { fontSize: 14, fontWeight: "800" },
  marcaDia: { width: 6, height: 6, borderRadius: 3 },
  legenda: { flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 7, paddingTop: 10, borderTopWidth: 1, borderTopColor: cores.linha },
  itemLegenda: { flexDirection: "row", alignItems: "center", gap: 5 },
  textoLegenda: { color: cores.secundario, fontSize: 12 },
  sugestao: { padding: 16, gap: 9, borderRadius: 22, backgroundColor: "#103D3D" },
  sugestaoTitulo: { color: "#D7F2E9", fontSize: 14, fontWeight: "700" },
  sugestaoData: { color: "white", fontSize: 19, fontWeight: "800", textTransform: "capitalize" },
});
