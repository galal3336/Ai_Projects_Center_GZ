<?php

namespace App\Models\Concerns;

use Illuminate\Support\Facades\App;

/**
 * Provides locale-aware attribute accessors for models with bilingual columns.
 *
 * Convention: for a base column `name`, the Arabic column is `name_ar`.
 *
 * Usage:
 *   $project->translated('title')         → title or title_ar based on locale
 *   $project->translatedTitle             → magic accessor (camelCase)
 *   $project->translatedAbstract
 *   $category->translatedName
 *   $category->translatedDescription
 */
trait HasTranslations
{
    /**
     * Returns the locale-appropriate value for a translatable column.
     * Falls back to the base (English) column if the Arabic value is empty.
     */
    public function translated(string $column, ?string $locale = null): ?string
    {
        $locale ??= App::getLocale();

        if ($locale !== 'en') {
            $arColumn = "{$column}_ar";
            $arValue  = $this->getAttribute($arColumn);
            if (!empty($arValue)) {
                return $arValue;
            }
        }

        return $this->getAttribute($column);
    }

    /**
     * Magic accessor: $model->translatedTitle → translated('title')
     *                 $model->translatedAbstract → translated('abstract')
     */
    public function __get($key)
    {
        if (str_starts_with($key, 'translated')) {
            $column = lcfirst(substr($key, strlen('translated')));
            // Convert camelCase → snake_case
            $snake = strtolower(preg_replace('/[A-Z]/', '_$0', lcfirst($column)));
            return $this->translated($snake);
        }

        return parent::__get($key);
    }
}
