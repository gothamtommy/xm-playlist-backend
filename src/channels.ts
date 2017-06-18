// http://www.siriusxm.com/albumart/Live/Default/DefaultMDS_m_52.jpg
export interface Channel {
  name: string;
  id: string;
  number: number;
  img?: string;
}
export const channels: Channel[] = [
  {
    id: 'thebeat',
    name: 'BPM',
    number: 51,
  },
  {
    id: 'area33',
    name: 'Electric Area',
    number: 52,
  },
  {
    id: 'chill',
    name: 'SiriusXM Chill',
    number: 53,
  },
];
