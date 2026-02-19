/**
 * CONFIGURATION DU THÈME
 * ---------------------
 * Changez la valeur de 'ACTIVE_THEME' pour changer l'apparence du site.
 * 
 * Valeurs disponibles :
 * - 'default'                (Bleu standard)
 * - 'bleu-ciel'              (Bleu ciel)
 * - 'vert-claire-electrique' (Vert électrique)
 * - 'rose-bonbon'            (Rose bonbon)
 * - 'blanc'                  (Blanc / Noir & Blanc)
 * - 'jaune-claire-soleil'    (Jaune soleil)
 * - 'or'                     (Or / Gold)
 */

export type ThemeType = 
  | 'default' 
  | 'bleu-ciel' 
  | 'vert-claire-electrique' 
  | 'rose-bonbon' 
  | 'blanc' 
  | 'jaune-claire-soleil' 
  | 'or';

export const ACTIVE_THEME: ThemeType = 'rose-bonbon';
