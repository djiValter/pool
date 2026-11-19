import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { dataLegivel, dinheiro, precos } from "../../reservas";
import type { useCalendario } from "../reservas/useCalendario";
import type { useFormulario } from "../reservas/useFormulario";
import { Botao } from "../ui/Botao";
import { Campo } from "../ui/Campo";
import { cores, s } from "../ui/tema";

export function Formulario({ data, calendario, formulario, confirmar }: {
  data: string;
  calendario: ReturnType<typeof useCalendario>;
  formulario: ReturnType<typeof useFormulario>;
  confirmar: () => void;
}) {
  const { horarios, carga, erroCalendario, actualizar } = calendario;
  const { hora, setHora, nome, setNome, email, setEmail, contacto, setContacto, pessoas, setPessoas, tipo, setTipo, erro, enviando } = formulario;
  const horariosDia = horarios.filter(item => item.data === data);
  const diaPrivado = horariosDia.some(item => item.tipo === "privado");

  return (
    <>
      <Text style={s.titulo}>A tua reserva</Text>
      <Text style={s.texto}>{dataLegivel(data)} · Hora de Maputo</Text>
      <View style={s.cartao}>
        <Text style={s.rotulo}>Horários já reservados</Text>
        <Text style={s.texto}>{diaPrivado ? "Dia reservado para uso privado." : horariosDia.map(item => item.hora.slice(0, 5)).join(" · ") || "Nenhum horário reservado."}</Text>
        {carga && <ActivityIndicator color={cores.verde} accessibilityLabel="A actualizar horários" />}
        {!!erroCalendario && <>
          <Text style={s.erro}>{erroCalendario}</Text>
          <Botao texto="Actualizar horários" variante="secundario" acao={actualizar} />
        </>}
      </View>
      <View style={s.cartao}>
        <Campo label="Hora" placeholder="Ex. 14:30" value={hora} maxLength={5} onChangeText={setHora} editable={!enviando} />
        <Campo label="Nome" value={nome} maxLength={100} onChangeText={setNome} editable={!enviando} autoComplete="name" />
        <Campo label="E-mail" value={email} maxLength={150} onChangeText={setEmail} editable={!enviando} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Campo label="Contacto" placeholder="+258" maxLength={30} value={contacto} onChangeText={setContacto} editable={!enviando} keyboardType="phone-pad" autoComplete="tel" />
        <Campo label="Número de pessoas" value={pessoas} onChangeText={setPessoas} editable={!enviando} keyboardType="number-pad" />
        <Text style={s.rotulo}>Tipo de reserva</Text>
        <View style={local.opcoes}>
          {(["normal", "privado"] as const).map(opcao => {
            const ocupada = opcao === "privado" && horariosDia.length > 0;
            return (
              <Pressable key={opcao} accessibilityRole="radio" accessibilityState={{ selected: tipo === opcao, disabled: ocupada || enviando }}
                disabled={enviando || ocupada} onPress={() => setTipo(opcao)}
                style={[local.opcao, tipo === opcao && local.opcaoActiva, ocupada && local.indisponivel]}>
                <Text style={[s.rotulo, s.maiuscula]}>{opcao}</Text>
                <Text style={s.texto}>{precos[opcao]} MT/pessoa</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={s.texto}>Reserva privada a partir de 8 pessoas.</Text>
        <View style={local.total}>
          <Text style={s.rotulo}>Total estimado</Text>
          <Text style={s.subtitulo}>{dinheiro((Number(pessoas) || 0) * precos[tipo])}</Text>
        </View>
        {!!erro && <Text accessibilityLiveRegion="polite" style={s.erro}>{erro}</Text>}
        <Botao texto={enviando ? "A confirmar…" : "Confirmar agendamento"}
          desactivado={enviando || carga || diaPrivado || !!erroCalendario} acao={confirmar} />
      </View>
    </>
  );
}

const local = StyleSheet.create({
  indisponivel: { opacity: 0.55 },
  opcoes: { flexDirection: "row", gap: 8 },
  opcao: { flex: 1, borderWidth: 1, borderRadius: 11, borderColor: cores.linha, padding: 10 },
  opcaoActiva: { backgroundColor: cores.claro, borderColor: cores.verde },
  total: { padding: 12, borderRadius: 11, backgroundColor: cores.claro, gap: 4 },
});
