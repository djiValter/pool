export type Tipo = "normal" | "privado";
export type Horario = { data: string; hora: string; tipo: Tipo };
export type Pedido = Horario & {
  nome: string;
  email: string;
  contacto: string;
  numero_pessoas: number;
};
export type Reserva = Pedido & { id: number; total: string | number };

export const precos = { normal: 100, privado: 150 };
const api = (process.env.EXPO_PUBLIC_API_URL || "https://pool-szew.onrender.com").replace(/\/+$/, "");

export function hojeEmMaputo(agora = new Date()) {
  // Maputo usa UTC+2 durante todo o ano.
  return new Date(agora.getTime() + 2 * 60 * 60 * 1000).toISOString();
}

export function dataISO(data: Date) {
  return data.toISOString().slice(0, 10);
}

export function dataLegivel(data: string) {
  return data.split("-").reverse().join("/");
}

export function dinheiro(valor: number) {
  return `${valor.toFixed(2).replace(".", ",")} MT`;
}

export function validar(pedido: Pedido, horarios: Horario[], agora = hojeEmMaputo()) {
  const { nome, email, contacto, numero_pessoas, tipo, data, hora } = pedido;
  if (nome.length < 2) return "Indica um nome com pelo menos 2 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Indica um e-mail válido.";
  if (contacto.replace(/\D/g, "").length < 7) return "Indica um contacto válido.";
  if (!Number.isSafeInteger(numero_pessoas) || numero_pessoas < 1) return "Indica um número inteiro de pessoas.";
  if (tipo === "privado" && numero_pessoas < 8) return "A reserva privada exige pelo menos 8 pessoas.";
  if (!/^(?:1[2-9]:[0-5]\d|20:00)$/.test(hora)) return "Indica uma hora entre 12:00 e 20:00.";
  if (`${data}T${hora}:00.000Z` <= agora) return "Escolhe uma data e hora futuras.";
  if (horarios.some(item => item.tipo === "privado")) return "Este dia está reservado para uso privado.";
  if (tipo === "privado" && horarios.length) return "Já existem reservas neste dia.";
  if (horarios.some(item => item.hora.slice(0, 5) === hora)) return "Este horário já está reservado.";
  return "";
}

export async function consultar(inicio: string, fim: string, signal: AbortSignal): Promise<Horario[]> {
  const resposta = await fetch(`${api}/agendamentos/ocupados?inicio=${inicio}&fim=${fim}`, { signal });
  if (!resposta.ok) throw new Error("Não foi possível consultar os horários.");
  return resposta.json();
}

export async function criar(pedido: Pedido) {
  const controller = new AbortController();
  const limite = setTimeout(() => controller.abort(), 45_000);
  try {
    const resposta = await fetch(`${api}/agendamentos/`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    });
    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => null);
      return { mensagem: typeof erro?.detail === "string" ? erro.detail : "O servidor não aceitou a reserva. Verifica os dados.", conflito: resposta.status === 409 };
    }
    return { reserva: await resposta.json() as Reserva };
  } finally {
    clearTimeout(limite);
  }
}

export function linkWhatsApp(reserva: Reserva) {
  let numero = reserva.contacto.replace(/\D/g, "").replace(/^00/, "");
  if (numero.length === 9) numero = `258${numero}`;
  const mensagem = [
    "Mergulhos Mundiais — Agendamento confirmado",
    `Reserva #${reserva.id}`,
    `Nome: ${reserva.nome}`,
    `Data: ${dataLegivel(reserva.data)} às ${reserva.hora.slice(0, 5)}`,
    `Tipo: ${reserva.tipo}`,
    `Pessoas: ${reserva.numero_pessoas}`,
    `Total: ${dinheiro(Number(reserva.total))}`,
  ].join("\n");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
