import Evolution from '$lib/evolution/Evolution';
import { writable } from 'svelte/store';

export const evolution = writable(Evolution.instance);
