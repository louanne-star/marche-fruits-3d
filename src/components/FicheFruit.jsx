import { useEffect, useRef } from 'react'
import { FRUIT_MODELS } from '../data/fruitModels'
import { STALLS } from '../data/stalls'

// Valeurs nutritionnelles de l'API (pour 100 g), dans l'ordre d'affichage
const NUTRIENTS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'sugar', label: 'Sucres', unit: 'g' },
  { key: 'carbohydrates', label: 'Glucides', unit: 'g' },
  { key: 'protein', label: 'Protéines', unit: 'g' },
  { key: 'fat', label: 'Lipides', unit: 'g' },
]

function stallOf(name) {
  return STALLS.find((stall) => stall.displays.some((display) => display.fruit === name))?.name
}

/**
 * Fiche d'un fruit : nom, classification et valeurs nutritionnelles.
 * Les barres comparent chaque valeur au maximum parmi tous les fruits de l'API.
 */
export default function FicheFruit({ name, fruits, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const fruit = fruits.find((f) => f.name === name)
  const { label } = FRUIT_MODELS[name]

  // Clic sur le fond assombri (en dehors de la carte) : on ferme
  const onDialogClick = (event) => {
    if (event.target === dialogRef.current) dialogRef.current.close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="fiche"
      onClose={onClose}
      onClick={onDialogClick}
      aria-labelledby="fiche-titre"
    >
      <div className="fiche-card">
        <header className="fiche-header">
          <div>
            <p className="fiche-stall">{stallOf(name)}</p>
            <h2 id="fiche-titre">{label}</h2>
            <p className="fiche-latin">{name}</p>
          </div>
          <button
            type="button"
            className="fiche-close"
            onClick={() => dialogRef.current.close()}
            aria-label="Fermer la fiche"
          >
            ×
          </button>
        </header>

        {fruit ? (
          <>
            <dl className="fiche-classification">
              <div>
                <dt>Famille</dt>
                <dd>{fruit.family}</dd>
              </div>
              <div>
                <dt>Ordre</dt>
                <dd>{fruit.order}</dd>
              </div>
              <div>
                <dt>Genre</dt>
                <dd>{fruit.genus}</dd>
              </div>
            </dl>

            <h3>
              Valeurs nutritionnelles <span>pour 100 g</span>
            </h3>
            <ul className="fiche-nutrition">
              {NUTRIENTS.map(({ key, label, unit }) => {
                const value = fruit.nutritions[key]
                const max = Math.max(...fruits.map((f) => f.nutritions[key]))
                return (
                  <li key={key}>
                    <span className="nutrient-label">{label}</span>
                    <span className="nutrient-bar" aria-hidden="true">
                      <span style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
                    </span>
                    <span className="nutrient-value">
                      {value} {unit}
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="fiche-note">Barres : comparaison avec le fruit le plus riche de la base.</p>
          </>
        ) : (
          <p>Données indisponibles pour ce fruit.</p>
        )}
      </div>
    </dialog>
  )
}
