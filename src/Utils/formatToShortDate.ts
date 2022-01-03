import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export default function formatToShortDate(date: string) {
  return format(
    new Date(),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  )
}

