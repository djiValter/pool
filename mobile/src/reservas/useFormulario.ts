import { useRef, useState } from "react";
import { criar, validar, type Horario, type Reserva, type Tipo } from "../../reservas";

type OpcoesEnvio = {
  data: string;
  horariosDia: Horario[];
  indisponivel: boolean;
  actualizar: () => void;
  aoConfirmar: (reserva: Reserva) => void;
};

export function useFormulario() {
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState<Tipo>("normal");
  const [pessoas, setPessoas] = useState("1");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [contacto, setContacto] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bloqueio = useRef(false);

  function prepararDia() {
    setHora("");
    setErro("");
  }

  async function confirmar({ data, horariosDia, indisponivel, actualizar, aoConfirmar }: OpcoesEnvio) {
    if (bloqueio.current || indisponivel) return;
    const pedido = { data, hora: hora.trim(), tipo, nome: nome.trim(), email: email.trim(), contacto: contacto.trim(), numero_pessoas: Number(pessoas) };
    const mensagem = validar(pedido, horariosDia);
    setErro(mensagem);
    if (mensagem) return;
    bloqueio.current = true;
    setEnviando(true);
    try {
      const resultado = await criar(pedido);
      if (resultado.reserva) {
        aoConfirmar(resultado.reserva);
        setHora("");
        actualizar();
      } else {
        setErro(resultado.mensagem);
        if (resultado.conflito) actualizar();
      }
    } catch {
      setErro("A ligação foi interrompida. Confirma os horários antes de repetir.");
      actualizar();
    } finally {
      bloqueio.current = false;
      setEnviando(false);
    }
  }

  return { hora, setHora, tipo, setTipo, pessoas, setPessoas, nome, setNome, email, setEmail, contacto, setContacto, erro, enviando, prepararDia, confirmar };
}
