import {
  Child,
} from './FamilyModule';

class Globals {
  children: Child[] = [];
}

const GL = new Globals();

export default GL as Globals;