import AllGuards from '../access.guard';

export type Action = Exclude<keyof typeof AllGuards, 'Pass'>;
