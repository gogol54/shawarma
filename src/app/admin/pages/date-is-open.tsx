'use client';

import { useEffect,useState } from 'react';
import { toast } from 'sonner';

const weekDays = [
  'Domingo', 'Segunda', 'Terça', 'Quarta',
  'Quinta', 'Sexta', 'Sábado'
];

type OpeningHour = {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export default function OpeningHoursForm() {
  const [hours, setHours] = useState<OpeningHour[]>([]);

  useEffect(() => {
    // Busque dados da API aqui se necessário
    const initial = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isOpen: false,
      openTime: '20:00',
      closeTime: '23:00',
    }));
    setHours(initial);
  }, []);

  const handleChange = (
    index: number,
    field: keyof OpeningHour,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updated = [...hours];

    if (field === 'isOpen') {
      updated[index].isOpen = event.target.checked;
    } else if (field === 'openTime' || field === 'closeTime') {
      updated[index][field] = event.target.value;
    }

    setHours(updated);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/opening-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hours),
      });

      if (!response.ok) throw new Error('Erro ao salvar');
      toast.success('Horários atualizados com sucesso!');
    } catch (error) {
      alert('Falha ao salvar: ' + error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Horários de Funcionamento</h2>
      {hours.map((hour, index) => (
        <div key={index} className="flex items-center gap-4">
          <label className="w-24">{weekDays[hour.dayOfWeek]}</label>
          <input
            type="checkbox"
            checked={hour.isOpen}
            onChange={(e) => handleChange(index, 'isOpen', e)}
          />
          <input
            type="time"
            value={hour.openTime}
            onChange={(e) => handleChange(index, 'openTime', e)}
            disabled={!hour.isOpen}
            className="border px-2 py-1 rounded"
          />
          <input
            type="time"
            value={hour.closeTime}
            onChange={(e) => handleChange(index, 'closeTime', e)}
            disabled={!hour.isOpen}
            className="border px-2 py-1 rounded"
          />
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Salvar
      </button>
    </div>
  );
}
