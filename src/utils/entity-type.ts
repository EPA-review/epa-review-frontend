export enum EntityType {
  PERSON = 'PERSON',
  LOCATION = 'LOCATION',
  NRP = 'NRP',
  PRONOUN = 'PRONOUN'
}

export const EntityTypeColorDict: { [entityName: string]: string } = {
  PERSON: 'red',
  LOCATION: 'yellow',
  NRP: 'blue',
  PRONOUN: 'green'
};