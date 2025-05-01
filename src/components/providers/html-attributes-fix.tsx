'use client';

import { useEffect } from 'react';

/**
 * Ce composant ajoute des attributs au HTML pour résoudre les problèmes d'hydratation
 * entre le rendu côté serveur et côté client.
 * Il s'agit d'une solution temporaire pour le développement.
 */
export function HtmlAttributesFix() {
  useEffect(() => {
    // Ajouter l'attribut love-deals à l'élément HTML pour correspondre au rendu serveur
    const htmlElement = document.documentElement;
    if (htmlElement && !htmlElement.hasAttribute('love-deals')) {
      htmlElement.setAttribute('love-deals', '879BC0364EB9EBEE3DBE71B15E175613');
    }
  }, []);

  return null;
}
