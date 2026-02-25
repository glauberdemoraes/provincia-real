import React, { useState } from 'react'
import { X, Plus, Save } from 'lucide-react'

interface FilterChip {
  key: string
  value: string | string[]
  label: string
}

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterChip[]) => void
  campaigns?: FilterOption[]
  countries?: FilterOption[]
  devices?: FilterOption[]
  statuses?: FilterOption[]
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFilterChange,
  campaigns = [],
  countries = [],
  devices = [],
  statuses = [],
}) => {
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([])
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({})

  const handleSelectOption = (
    section: string,
    value: string,
  ) => {
    setSelectedValues((prev) => {
      const current = prev[section] || []
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [section]: updated }
    })
  }

  const applyFilters = () => {
    const newFilters: FilterChip[] = []

    if (selectedValues.campaigns?.length) {
      newFilters.push({
        key: 'campaigns',
        value: selectedValues.campaigns,
        label: `Campaigns: ${selectedValues.campaigns.length}`,
      })
    }

    if (selectedValues.countries?.length) {
      newFilters.push({
        key: 'countries',
        value: selectedValues.countries,
        label: `Countries: ${selectedValues.countries.length}`,
      })
    }

    if (selectedValues.devices?.length) {
      newFilters.push({
        key: 'devices',
        value: selectedValues.devices,
        label: `Devices: ${selectedValues.devices.length}`,
      })
    }

    if (selectedValues.statuses?.length) {
      newFilters.push({
        key: 'statuses',
        value: selectedValues.statuses,
        label: `Statuses: ${selectedValues.statuses.length}`,
      })
    }

    setActiveFilters(newFilters)
    onFilterChange(newFilters)
    setExpandedSection(null)
  }

  const removeFilter = (key: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.key !== key))
    setSelectedValues((prev) => ({ ...prev, [key]: [] }))
  }

  const resetAllFilters = () => {
    setActiveFilters([])
    setSelectedValues({})
    onFilterChange([])
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Advanced Filters
        </h3>
        {activeFilters.length > 0 && (
          <button
            onClick={resetAllFilters}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <div
              key={filter.key}
              className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-900 dark:bg-blue-900 dark:text-blue-100"
            >
              <span>{filter.label}</span>
              <button
                onClick={() => removeFilter(filter.key)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter Sections */}
      <div className="space-y-2">
        {/* Campaigns */}
        {campaigns.length > 0 && (
          <FilterSection
            title="Campaigns"
            section="campaigns"
            options={campaigns}
            selectedValues={selectedValues.campaigns || []}
            expanded={expandedSection === 'campaigns'}
            onToggle={() =>
              setExpandedSection(
                expandedSection === 'campaigns' ? null : 'campaigns',
              )
            }
            onSelect={(value) => handleSelectOption('campaigns', value)}
          />
        )}

        {/* Countries */}
        {countries.length > 0 && (
          <FilterSection
            title="Countries"
            section="countries"
            options={countries}
            selectedValues={selectedValues.countries || []}
            expanded={expandedSection === 'countries'}
            onToggle={() =>
              setExpandedSection(
                expandedSection === 'countries' ? null : 'countries',
              )
            }
            onSelect={(value) => handleSelectOption('countries', value)}
          />
        )}

        {/* Devices */}
        {devices.length > 0 && (
          <FilterSection
            title="Devices"
            section="devices"
            options={devices}
            selectedValues={selectedValues.devices || []}
            expanded={expandedSection === 'devices'}
            onToggle={() =>
              setExpandedSection(
                expandedSection === 'devices' ? null : 'devices',
              )
            }
            onSelect={(value) => handleSelectOption('devices', value)}
          />
        )}

        {/* Statuses */}
        {statuses.length > 0 && (
          <FilterSection
            title="Statuses"
            section="statuses"
            options={statuses}
            selectedValues={selectedValues.statuses || []}
            expanded={expandedSection === 'statuses'}
            onToggle={() =>
              setExpandedSection(
                expandedSection === 'statuses' ? null : 'statuses',
              )
            }
            onSelect={(value) => handleSelectOption('statuses', value)}
          />
        )}
      </div>

      {/* Apply Button */}
      {Object.values(selectedValues).some((v) => v.length > 0) && (
        <button
          onClick={applyFilters}
          className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <Save className="mr-2 inline h-4 w-4" />
          Apply Filters
        </button>
      )}
    </div>
  )
}

interface FilterSectionProps {
  title: string
  section: string
  options: FilterOption[]
  selectedValues: string[]
  expanded: boolean
  onToggle: () => void
  onSelect: (value: string) => void
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options,
  selectedValues,
  expanded,
  onToggle,
  onSelect,
}) => {
  return (
    <div className="border-b border-gray-200 pb-2 dark:border-gray-800">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        <span>{title}</span>
        <Plus
          className={`h-4 w-4 transition-transform ${expanded ? 'rotate-45' : ''}`}
        />
      </button>

      {expanded && (
        <div className="space-y-2 py-2">
          {options.map((option) => (
            <label key={option.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => onSelect(option.value)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
              {option.count !== undefined && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({option.count})
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
