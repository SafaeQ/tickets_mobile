import React from 'react';
import {TicketsContext, TicketsType} from './contextUser';

export default function useTicketsAtom(): [
  TicketsType,
  React.Dispatch<React.SetStateAction<TicketsType>>,
] {
  const useTickets = React.useContext(TicketsContext);
  const {ticketsGlobl, setTicketsGlobal} = useTickets.ticketState;
  return [ticketsGlobl, setTicketsGlobal];
}
