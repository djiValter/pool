import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Begin() {
    const navigate = useNavigate();
    const [carregando, setCarregando] = useState(false);
    const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (temporizador.current !== null) {
                clearTimeout(temporizador.current);
            }
        };
    }, []);

    function entrar() {
        if (temporizador.current !== null) return;

        setCarregando(true);
        temporizador.current = setTimeout(() => {
            navigate("/mergulhos");
        }, 1000);
    }

    return (
        <section
            className="relative isolate flex min-h-screen min-h-dvh items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-6 py-16"
            style={{ backgroundImage: "url('/imagem.jpeg')" }}
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/40 via-slate-950/50 to-slate-950/80"
            />

            <div className="flex max-w-4xl flex-col items-center text-center text-white">
                <span className="mb-6 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium tracking-widest uppercase backdrop-blur-sm sm:text-sm">
                    O teu próximo mergulho começa aqui
                </span>

                <h1 className="text-5xl leading-tight font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
                    MERGULHOS
                    <span className="block text-yellow-300">
                        MUNDIAIS
                    </span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-xl">
                    Escolhe o teu dia, reserva o teu horário e desfruta
                    de um momento na piscina.
                </p>

                <button
                    type="button"
                    onClick={entrar}
                    disabled={carregando}
                    aria-busy={carregando}
                    className="mt-10 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-yellow-300 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg transition duration-200 enabled:hover:-translate-y-1 enabled:hover:bg-yellow-200 disabled:cursor-wait disabled:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-300 motion-reduce:transform-none motion-reduce:transition-none"
                >
                    {carregando ? (
                        <span
                            aria-hidden="true"
                            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950 motion-reduce:animate-none"
                        />
                    ) : null}

                    <span role="status">
                        {carregando ? "A preparar…" : "Agendar um mergulho"}
                    </span>

                    {!carregando && <span aria-hidden="true">→</span>}
                </button>

                <p className="mt-4 text-sm text-slate-300">
                    Consulta os horários disponíveis e faz a tua reserva.
                </p>
            </div>
        </section>
    );
}