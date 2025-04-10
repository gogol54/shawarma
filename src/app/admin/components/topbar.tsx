import React from "react";

const Topbar = () => {
  return (
    <div className="h-[200px] w-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-md rounded-b-2xl flex items-center text-center px-10">
      <div>
        <h1 className="text-white text-3xl font-bold justify-center text-center">Bem-vindo ao Painel Admin</h1>
        <p className="text-white/90 text-lg mt-2">Aqui você gerencia os lanches, pedidos e mais.</p>
      </div>
    </div>
  );
};

export default Topbar;
