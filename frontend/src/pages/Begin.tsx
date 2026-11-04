import {Link} from "react-router-dom";

export function Begin() {
    return (
        <>
            <section className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center gap-10 justify-center text-center" style={{ backgroundImage: "url('/imagem.jpeg')"}}>
                <h1 className="font-bold text-8xl text-white">MERGULHOS MUNDIAS</h1>
                <Link to="/mergulhos" className="bg-yellow-300 px-6 py-3 w-22 h-10 text-xl text-center flex items-center justify-center rounded-lg">Entrar</Link>
            </section>
        </>
    )
}
