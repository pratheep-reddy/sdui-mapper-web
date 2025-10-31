'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { API_ENDPOINTS } from '@/lib/constants';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Variable {
  name: string;
  type: string;
  value: any;
}

interface VariableEditorProps {
  variables: Variable[];
  templateData: {
    templateId: string;
    templateName: string;
    templateType: 'static' | 'dynamic';
    staticTemplateJson: any;
    dynamicTemplateJson: any;
  };
  onPreviewRefresh?: () => void;
}

export default function VariableEditor({ variables, templateData, onPreviewRefresh }: VariableEditorProps) {
  const [mode, setMode] = useState<'static' | 'dynamic'>(templateData.templateType || 'static');
  const [variableValues, setVariableValues] = useState<Record<string, any>>(() => {
    const initialValues: Record<string, any> = {};
    variables.forEach(variable => {
      initialValues[variable.name] = variable.value;
    });
    return initialValues;
  });
  const [selectedArrayIndices, setSelectedArrayIndices] = useState<Record<string, number>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [dynamicSettingsLoaded, setDynamicSettingsLoaded] = useState(false);
  
  const [apiEndpoint, setApiEndpoint] = useState('https://api.example.com/data');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [requestJson, setRequestJson] = useState(JSON.stringify({ key: 'value' }, null, 2));
  const [responseJson, setResponseJson] = useState(JSON.stringify({
    data: {
      name: 'Example Name',
      discount: 'Get 10% Off',
      items: []
    }
  }, null, 2));
  const [selectedMappingField, setSelectedMappingField] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [dynamicTab, setDynamicTab] = useState<'settings' | 'mapping'>('settings');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [variableNames, setVariableNames] = useState<Record<number, string>>(() => {
    const names: Record<number, string> = {};
    variables.forEach((v, idx) => {
      names[idx] = v.name;
    });
    return names;
  });
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' }
  ]);

  useEffect(() => {
    const fetchDynamicSettings = async () => {
      if (mode === 'dynamic' && !dynamicSettingsLoaded && templateData?.templateId) {
        try {
          const response = await fetch(API_ENDPOINTS.templates.dynamicSettings.list(templateData.templateId));
          const result = await response.json();
          
          if (result.success && result.data) {
            // Prefill API settings if they exist
            setApiEndpoint(result.data.endpoint || 'https://api.example.com/data');
            setApiMethod(result.data.httpMethod || 'GET');
            setRequestJson(JSON.stringify(result.data.requestJson || { key: 'value' }, null, 2));
            
            // Load headers if they exist
            if (result.data.headerJson && typeof result.data.headerJson === 'object') {
              const loadedHeaders = Object.entries(result.data.headerJson).map(([key, value]) => ({
                key,
                value: String(value)
              }));
              if (loadedHeaders.length > 0) {
                setHeaders(loadedHeaders);
              }
            }
          }
          // Mark as loaded regardless of whether data exists
          setDynamicSettingsLoaded(true);
        } catch (error) {
          console.error('Error fetching dynamic settings:', error);
          setDynamicSettingsLoaded(true);
        }
      }
    };

    fetchDynamicSettings();
  }, [mode, dynamicSettingsLoaded, templateData]);

  // Load field mappings and arrayKeyName from dynamic template JSON (don't auto-generate)
  // Only load on initial mount or when switching to dynamic mode
  useEffect(() => {
    if (mode === 'dynamic' && variables.length > 0) {
      const loadedMappings: Record<string, string> = {};
      const loadedNames: Record<number, string> = {};
      
      // Get the dynamic template JSON or fall back to static template JSON
      const sourceJson = templateData.dynamicTemplateJson || templateData.staticTemplateJson;
      
      if (sourceJson) {
        // Find the variables array location
        let variablesArray: any[] | null = null;
        if (sourceJson.card?.variables) {
          variablesArray = sourceJson.card.variables;
        } else if (sourceJson.variables) {
          variablesArray = sourceJson.variables;
        } else if (sourceJson.template?.variables) {
          variablesArray = sourceJson.template.variables;
        }

        if (variablesArray) {
          variables.forEach((variable, index) => {
            const templateVariable = variablesArray[index];
            if (!templateVariable) return;

            // Load arrayKeyName if it exists
            if (templateVariable.arrayKeyName) {
              loadedNames[index] = templateVariable.arrayKeyName;
            }

            // Use arrayKeyName if available, otherwise use variable.name
            const varName = templateVariable.arrayKeyName || variable.name;

            if (variable.type === 'array' && Array.isArray(templateVariable.value) && templateVariable.value.length > 0) {
              // For array variables, extract field mappings from template
              const firstItem = templateVariable.value[0];
              Object.keys(firstItem).forEach((fieldName) => {
                const fieldKey = `${varName}.${fieldName}`;
                const templateValue = firstItem[fieldName];
                // Only set if the value looks like a mapping (contains {{...}})
                if (typeof templateValue === 'string' && templateValue.includes('{{')) {
                  loadedMappings[fieldKey] = templateValue;
                } else {
                  // Leave empty if no mapping exists
                  loadedMappings[fieldKey] = '';
                }
              });
            } else {
              // For non-array variables
              const templateValue = templateVariable.value;
              // Only set if the value looks like a mapping (contains {{...}})
              if (typeof templateValue === 'string' && templateValue.includes('{{')) {
                loadedMappings[variable.name] = templateValue;
              } else {
                // Leave empty if no mapping exists
                loadedMappings[variable.name] = '';
              }
            }
          });
        }
      }

      setFieldMappings(loadedMappings);
      setVariableNames(loadedNames);
    }
  }, [mode, variables]); // Removed templateData from dependencies to prevent clearing after save

  const getJsonPaths = (jsonString: string): string[] => {
    try {
      const obj = JSON.parse(jsonString);
      const paths: string[] = [];
      
      const traverse = (current: any, path: string) => {
        if (current === null || current === undefined) {
          paths.push(path);
          return;
        }
        
        if (typeof current === 'object' && !Array.isArray(current)) {
          Object.keys(current).forEach(key => {
            const newPath = path ? `${path}.${key}` : key;
            traverse(current[key], newPath);
          });
        } else if (Array.isArray(current)) {
          if (current.length > 0) {
            traverse(current[0], path);
          } else {
            paths.push(path);
          }
        } else {
          paths.push(path);
        }
      };
      
      traverse(obj, 'response');
      return paths;
    } catch (error) {
      return ['response'];
    }
  };

  const handleMappingInputChange = (fieldKey: string, value: string, inputElement: HTMLInputElement) => {
    setFieldMappings(prev => ({ ...prev, [fieldKey]: value }));
    
    const cursorPos = inputElement.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const match = textBeforeCursor.match(/\{\{response\.([^}]*)$/);
    
    if (match) {
      const filter = match[1] || '';
      setSuggestionFilter(filter);
      setShowSuggestions(true);
      setActiveSuggestionIndex(0);
      setSelectedMappingField(fieldKey);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertSuggestion = (suggestion: string, inputElement: HTMLInputElement) => {
    const value = inputElement.value;
    const cursorPos = inputElement.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    
    const match = textBeforeCursor.match(/\{\{response\.([^}]*)$/);
    if (match) {
      const startPos = textBeforeCursor.lastIndexOf('{{response.');
      const pathOnly = suggestion.replace('response.', '');
      const newValue = value.slice(0, startPos) + '{{' + suggestion + '}}' + textAfterCursor;
      
      const fieldKey = selectedMappingField || '';
      setFieldMappings(prev => ({ ...prev, [fieldKey]: newValue }));
      inputElement.value = newValue;
      setShowSuggestions(false);
    }
  };

  const getFilteredSuggestions = () => {
    const allPaths = getJsonPaths(responseJson);
    if (!suggestionFilter) return allPaths;
    
    return allPaths.filter(path => 
      path.toLowerCase().includes(suggestionFilter.toLowerCase()) ||
      path.replace('response.', '').toLowerCase().startsWith(suggestionFilter.toLowerCase())
    );
  };

  const handleVariableChange = (name: string, value: any) => {
    setVariableValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateTemplate = async () => {
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const templateId = templateData?.templateId;
      if (!templateId) {
        throw new Error('Template ID not found');
      }

      // Prepare update payload based on mode
      let updatePayload: any = {};

      if (mode === 'static') {
        // For static mode: only update staticTemplateJson
        const updatedStaticJson = {
          ...templateData.staticTemplateJson,
        };

        if (updatedStaticJson.card?.variables) {
          updatedStaticJson.card.variables = updatedStaticJson.card.variables.map((variable: Variable) => ({
            ...variable,
            value: variableValues[variable.name] !== undefined 
              ? variableValues[variable.name] 
              : variable.value
          }));
        } else if (updatedStaticJson.variables) {
          updatedStaticJson.variables = updatedStaticJson.variables.map((variable: Variable) => ({
            ...variable,
            value: variableValues[variable.name] !== undefined 
              ? variableValues[variable.name] 
              : variable.value
          }));
        } else if (updatedStaticJson.template?.variables) {
          updatedStaticJson.template.variables = updatedStaticJson.template.variables.map((variable: Variable) => ({
            ...variable,
            value: variableValues[variable.name] !== undefined 
              ? variableValues[variable.name] 
              : variable.value
          }));
        }

        updatePayload = {
          staticTemplateJson: updatedStaticJson,
          templateType: 'static',
        };
      } else {
        // For dynamic mode: only update dynamicTemplateJson and templateType
        const updatedDynamicJson = {
          ...templateData.dynamicTemplateJson,
        };

        if (updatedDynamicJson.card?.variables) {
          updatedDynamicJson.card.variables = updatedDynamicJson.card.variables.map((variable: Variable) => ({
            ...variable,
            value: variableValues[variable.name] !== undefined 
              ? variableValues[variable.name] 
              : variable.value
          }));
        } else if (updatedDynamicJson.variables) {
          updatedDynamicJson.variables = updatedDynamicJson.variables.map((variable: Variable) => ({
            ...variable,
            value: variableValues[variable.name] !== undefined 
              ? variableValues[variable.name] 
              : variable.value
          }));
        } else if (updatedDynamicJson.template?.variables) {
          updatedDynamicJson.template.variables = updatedDynamicJson.template.variables.map((variable: Variable) => ({
            ...variable,
            value: variableValues[variable.name] !== undefined 
              ? variableValues[variable.name] 
              : variable.value
          }));
        }

        updatePayload = {
          dynamicTemplateJson: updatedDynamicJson,
          templateType: 'dynamic',
        };
      }

      const response = await fetch(API_ENDPOINTS.templates.update(templateId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      const result = await response.json();

      if (result.success) {
        setUpdateMessage({ type: 'success', text: 'Template updated successfully!' });
        // Refresh preview if callback provided
        if (onPreviewRefresh) {
          onPreviewRefresh();
        }
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      setUpdateMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update template' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((_, i) => i !== index));
    }
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index][field] = value;
    setHeaders(updatedHeaders);
  };

  const handleSaveApiSettings = async () => {
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const templateId = templateData?.templateId;
      if (!templateId) {
        throw new Error('Template ID not found');
      }

      let parsedRequestJson = {};
      try {
        parsedRequestJson = JSON.parse(requestJson);
      } catch (e) {
        throw new Error('Invalid request JSON format');
      }

      // Convert headers array to JSON object
      const headerJson: Record<string, string> = {};
      headers.forEach(header => {
        if (header.key.trim() !== '') {
          headerJson[header.key] = header.value;
        }
      });

      // First, update template type to dynamic
      const updateTypeResponse = await fetch(API_ENDPOINTS.templates.update(templateId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType: 'dynamic',
        }),
      });

      if (!updateTypeResponse.ok) {
        throw new Error('Failed to update template type');
      }

      // Then save API settings with headers
      const response = await fetch(API_ENDPOINTS.templates.dynamicSettings.create(templateId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: apiEndpoint,
          httpMethod: apiMethod,
          requestJson: parsedRequestJson,
          headerJson: headerJson,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save API settings');
      }

      const result = await response.json();

      if (result.success) {
        setUpdateMessage({ type: 'success', text: 'API settings saved successfully!' });
        // Refresh preview if callback provided
        if (onPreviewRefresh) {
          onPreviewRefresh();
        }
        setTimeout(() => {
          setUpdateMessage(null);
        }, 2000);
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      setUpdateMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save API settings' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveMappings = async () => {
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const templateId = templateData?.templateId;
      if (!templateId) {
        throw new Error('Template ID not found');
      }

      // In dynamic mode, update dynamicTemplateJson (or create from staticTemplateJson if it doesn't exist)
      const sourceJson = templateData.dynamicTemplateJson || templateData.staticTemplateJson;
      const updatedTemplateJson = JSON.parse(JSON.stringify(sourceJson));
      
      // Find the variables array location (card.variables, variables, or template.variables)
      let variablesArray: any[] | null = null;
      let variablesPath: string = '';
      
      if (updatedTemplateJson.card?.variables) {
        variablesArray = updatedTemplateJson.card.variables;
        variablesPath = 'card.variables';
      } else if (updatedTemplateJson.variables) {
        variablesArray = updatedTemplateJson.variables;
        variablesPath = 'variables';
      } else if (updatedTemplateJson.template?.variables) {
        variablesArray = updatedTemplateJson.template.variables;
        variablesPath = 'template.variables';
      }

      if (variablesArray) {
        // Update arrayKeyName and apply field mappings (don't modify variable.name)
        variables.forEach((variable, index) => {
          const newName = variableNames[index];
          
          if (variablesArray[index]) {
            // For array variables, set arrayKeyName if a new name is provided
            if (variable.type === 'array') {
              if (newName) {
                variablesArray[index].arrayKeyName = newName;
              } else {
                // Remove arrayKeyName if cleared
                delete variablesArray[index].arrayKeyName;
              }
            }
            
            // For array variables, update field mappings in the template
            if (variable.type === 'array' && Array.isArray(variable.value) && variable.value.length > 0) {
              const firstItem = variable.value[0];
              const fields = Object.keys(firstItem);
              
              // Use newName if available, otherwise use variable.name
              const varNameForMapping = newName || variable.name;
              
              // Apply field mappings to the first item template
              fields.forEach((fieldName) => {
                const fieldKey = `${varNameForMapping}.${fieldName}`;
                const mapping = fieldMappings[fieldKey];
                
                if (mapping && variablesArray[index].value[0]) {
                  variablesArray[index].value[0][fieldName] = mapping;
                }
              });
            } else {
              // For primitive/object variables, apply direct mapping
              const varNameForMapping = newName || variable.name;
              const fieldKey = varNameForMapping;
              const mapping = fieldMappings[fieldKey];
              if (mapping) {
                variablesArray[index].value = mapping;
              }
            }
          }
        });
        
        // Save updated template to backend as dynamicTemplateJson
        const response = await fetch(API_ENDPOINTS.templates.update(templateId), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dynamicTemplateJson: updatedTemplateJson,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save template');
        }
      }

      setUpdateMessage({ type: 'success', text: 'Variable mappings saved successfully!' });
      
      // Refresh preview if callback provided
      if (onPreviewRefresh) {
        onPreviewRefresh();
      }
      
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    } catch (error) {
      setUpdateMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save variable mappings' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSyncResponse = async () => {
    if (!apiEndpoint) {
      setSyncStatus({ type: 'error', text: 'Please provide an endpoint URL.' });
      return;
    }

    let parsedRequest: any = undefined;
    if (apiMethod !== 'GET') {
      try {
        parsedRequest = requestJson ? JSON.parse(requestJson) : {};
      } catch (error) {
        setSyncStatus({ type: 'error', text: 'Request JSON is invalid. Please fix it before syncing.' });
        return;
      }
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const fetchOptions: RequestInit = {
        method: apiMethod,
        headers: apiMethod === 'GET' ? undefined : { 'Content-Type': 'application/json' },
        body: apiMethod === 'GET' ? undefined : JSON.stringify(parsedRequest ?? {}),
      };

      const response = await fetch(apiEndpoint, fetchOptions);
      const responseText = await response.text();

      if (!response.ok) {
        setSyncStatus({
          type: 'error',
          text: `Request failed (${response.status}): ${responseText || response.statusText || 'Unknown error'}`,
        });
        return;
      }

      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (error) {
        parsedResponse = responseText;
      }

      setResponseJson(
        typeof parsedResponse === 'string'
          ? parsedResponse
          : JSON.stringify(parsedResponse, null, 2),
      );

      setSyncStatus({
        type: 'success',
        text: `Successfully synced response (${response.status} ${response.statusText || 'OK'})`,
      });
    } catch (error) {
      setSyncStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to sync response',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleArrayItemFieldChange = (variableName: string, itemIndex: number, fieldName: string, fieldValue: any) => {
    setVariableValues(prev => {
      const currentArray = [...(prev[variableName] || [])];
      if (currentArray[itemIndex]) {
        currentArray[itemIndex] = {
          ...currentArray[itemIndex],
          [fieldName]: fieldValue
        };
      }
      return {
        ...prev,
        [variableName]: currentArray
      };
    });
  };

  const addArrayItem = (variableName: string) => {
    setVariableValues(prev => {
      const currentArray = prev[variableName] || [];
      const template = currentArray[0] || {};
      const newItem: any = {};
      
      Object.keys(template).forEach(key => {
        const value = template[key];
        if (typeof value === 'string') newItem[key] = '';
        else if (typeof value === 'number') newItem[key] = 0;
        else if (typeof value === 'boolean') newItem[key] = false;
        else if (Array.isArray(value)) newItem[key] = [];
        else if (typeof value === 'object') newItem[key] = {};
        else newItem[key] = '';
      });
      
      return {
        ...prev,
        [variableName]: [...currentArray, newItem]
      };
    });
  };

  const removeArrayItem = (variableName: string, itemIndex: number) => {
    setVariableValues(prev => {
      const currentArray = [...(prev[variableName] || [])];
      currentArray.splice(itemIndex, 1);
      return {
        ...prev,
        [variableName]: currentArray
      };
    });
    
    setSelectedArrayIndices(prev => {
      const currentIndex = prev[variableName] || 0;
      if (currentIndex >= (variableValues[variableName]?.length || 1) - 1) {
        return { ...prev, [variableName]: Math.max(0, currentIndex - 1) };
      }
      return prev;
    });
  };

  const renderFieldInput = (fieldName: string, fieldValue: any, onChange: (value: any) => void) => {
    const fieldType = typeof fieldValue;

    if (fieldType === 'string') {
      return (
        <input
          type="text"
          value={fieldValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 bg-white"
          placeholder={`Enter ${fieldName}`}
        />
      );
    } else if (fieldType === 'number') {
      return (
        <input
          type="number"
          value={fieldValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 bg-white"
          placeholder={`Enter ${fieldName}`}
        />
      );
    } else if (fieldType === 'boolean') {
      return (
        <div className="flex items-center space-x-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={fieldValue === true}
              onChange={() => onChange(true)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">True</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={fieldValue === false}
              onChange={() => onChange(false)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-slate-700">False</span>
          </label>
        </div>
      );
    } else if (Array.isArray(fieldValue)) {
      return (
        <textarea
          value={JSON.stringify(fieldValue, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch (error) {
              // Keep as string if invalid JSON
            }
          }}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs text-slate-900 bg-white"
          placeholder="Enter JSON array"
        />
      );
    } else if (fieldType === 'object' && fieldValue !== null) {
      return (
        <textarea
          value={JSON.stringify(fieldValue, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch (error) {
              // Keep as string if invalid JSON
            }
          }}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs text-slate-900 bg-white"
          placeholder="Enter JSON object"
        />
      );
    } else {
      return (
        <input
          type="text"
          value={String(fieldValue)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 bg-white"
          placeholder={`Enter ${fieldName}`}
        />
      );
    }
  };

  const renderArrayVariable = (variable: Variable) => {
    const currentValue = variableValues[variable.name];
    if (!Array.isArray(currentValue) || currentValue.length === 0) {
      return (
        <div className="text-center py-6 bg-slate-50 rounded-lg">
          <p className="text-slate-500 text-sm mb-3">No items in this array</p>
          <button
            onClick={() => addArrayItem(variable.name)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Item
          </button>
        </div>
      );
    }

    const selectedIndex = selectedArrayIndices[variable.name] || 0;
    const currentItem = currentValue[selectedIndex] || {};

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
            <button
              onClick={() => setSelectedArrayIndices(prev => ({
                ...prev,
                [variable.name]: Math.max(0, selectedIndex - 1)
              }))}
              disabled={selectedIndex === 0}
              className="px-3 py-1 bg-white border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-900"
            >
              ← Previous
            </button>
            <span className="text-sm font-medium text-slate-700">
              Item {selectedIndex + 1} of {currentValue.length}
            </span>
            <button
              onClick={() => setSelectedArrayIndices(prev => ({
                ...prev,
                [variable.name]: Math.min(currentValue.length - 1, selectedIndex + 1)
              }))}
              disabled={selectedIndex === currentValue.length - 1}
              className="px-3 py-1 bg-white border border-slate-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-900"
            >
              Next →
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => addArrayItem(variable.name)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
              title="Add new item"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
            <button
              onClick={() => removeArrayItem(variable.name, selectedIndex)}
              disabled={currentValue.length <= 1}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete current item"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-4 pr-2">
          {Object.entries(currentItem).map(([fieldName, fieldValue]) => (
            <div key={fieldName} className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                {fieldName}
              </label>
              {renderFieldInput(
                fieldName,
                fieldValue,
                (newValue) => handleArrayItemFieldChange(variable.name, selectedIndex, fieldName, newValue)
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVariableInput = (variable: Variable) => {
    const currentValue = variableValues[variable.name];

    if (variable.type === 'array') {
      return renderArrayVariable(variable);
    }

    switch (variable.type) {
      case 'string':
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white"
            placeholder={`Enter ${variable.name}`}
          />
        );
      
      case 'number':
      case 'integer':
        return (
          <input
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleVariableChange(variable.name, Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white"
            placeholder={`Enter ${variable.name}`}
          />
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={variable.name}
                checked={currentValue === true}
                onChange={() => handleVariableChange(variable.name, true)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-slate-700">True</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={variable.name}
                checked={currentValue === false}
                onChange={() => handleVariableChange(variable.name, false)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-slate-700">False</span>
            </label>
          </div>
        );
      
      case 'dict':
      case 'object':
        return (
          <div className="space-y-2">
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <MonacoEditor
                height="200px"
                language="json"
                theme="vs-light"
                value={typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : currentValue}
                onChange={(value) => {
                  try {
                    const parsed = JSON.parse(value || '{}');
                    handleVariableChange(variable.name, parsed);
                  } catch (e) {
                    // Keep the text as-is if it's not valid JSON yet
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
            <p className="text-xs text-slate-500">Edit the JSON object</p>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue)}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-white"
            placeholder={`Enter ${variable.name}`}
          />
        );
    }
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="inline-flex flex-1 gap-1 p-1 rounded-lg border" style={{ borderColor: 'rgba(231, 94, 39, 0.2)', backgroundColor: 'rgba(231, 94, 39, 0.05)' }}>
            <button
              onClick={() => setMode('static')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                mode === 'static'
                  ? 'bg-white shadow-sm border'
                  : ''
              }`}
              style={mode === 'static' ? { color: '#e75e27', borderColor: 'rgba(231, 94, 39, 0.3)' } : { color: 'rgba(231, 94, 39, 0.7)' }}
            >
              Static
            </button>
            <button
              onClick={() => setMode('dynamic')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                mode === 'dynamic'
                  ? 'bg-white shadow-sm border'
                  : ''
              }`}
              style={mode === 'dynamic' ? { color: '#e75e27', borderColor: 'rgba(231, 94, 39, 0.3)' } : { color: 'rgba(231, 94, 39, 0.7)' }}
            >
              Dynamic
            </button>
          </div>
          
          {mode === 'static' && variables.length > 0 && (
            <button 
              onClick={handleUpdateTemplate}
              disabled={isUpdating}
              className="px-4 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border whitespace-nowrap"
              style={{ 
                backgroundColor: isUpdating ? '#f9fafb' : 'rgba(231, 94, 39, 0.08)',
                borderColor: isUpdating ? '#d1d5db' : 'rgba(231, 94, 39, 0.3)',
                color: isUpdating ? '#6b7280' : '#e75e27',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem'
              }}
            >
              {isUpdating ? 'Updating...' : 'Update Template'}
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {mode === 'static' ? (
          <div className="space-y-4">
            {updateMessage && (
              <div className={`p-2.5 rounded-md text-xs ${
                updateMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {updateMessage.text}
              </div>
            )}
            
            {variables.length > 0 ? (
              [...variables].sort((a, b) => {
                const aIsArray = a.type === 'array' ? 1 : 0;
                const bIsArray = b.type === 'array' ? 1 : 0;
                return aIsArray - bIsArray;
              }).map((variable, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">
                      {variable.name}
                    </label>
                    <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">
                      {variable.type}
                    </span>
                  </div>
                  {renderVariableInput(variable)}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg 
                  className="w-12 h-12 mx-auto mb-2 text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                  />
                </svg>
                <p className="text-gray-400 text-xs">No variables defined</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex w-full gap-1 p-1 rounded-lg border" style={{ borderColor: 'rgba(231, 94, 39, 0.2)', backgroundColor: 'rgba(231, 94, 39, 0.05)' }}>
              <button
                onClick={() => setDynamicTab('settings')}
                className={`flex-1 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  dynamicTab === 'settings'
                    ? 'bg-white shadow-sm border'
                    : ''
                }`}
                style={dynamicTab === 'settings' ? { color: '#e75e27', borderColor: 'rgba(231, 94, 39, 0.3)' } : { color: 'rgba(231, 94, 39, 0.7)' }}
              >
                Settings
              </button>
              <button
                onClick={() => setDynamicTab('mapping')}
                className={`flex-1 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  dynamicTab === 'mapping'
                    ? 'bg-white shadow-sm border'
                    : ''
                }`}
                style={dynamicTab === 'mapping' ? { color: '#e75e27', borderColor: 'rgba(231, 94, 39, 0.3)' } : { color: 'rgba(231, 94, 39, 0.7)' }}
              >
                Mapping
              </button>
            </div>

            {dynamicTab === 'settings' ? (
              <div className="space-y-3">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      API Endpoint
                    </label>
                    <input
                      type="text"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 bg-white"
                      placeholder="https://api.example.com/endpoint"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      HTTP Method
                    </label>
                    <select
                      value={apiMethod}
                      onChange={(e) => setApiMethod(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 bg-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                </div>

                {apiMethod !== 'GET' && (
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Request JSON
                    </label>
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <MonacoEditor
                        height="150px"
                        language="json"
                        theme="vs-light"
                        value={requestJson}
                        onChange={(value) => setRequestJson(value || '')}
                        options={{
                          minimap: { enabled: false },
                          lineNumbers: 'off',
                          scrollBeyondLastLine: false,
                          fontSize: 12,
                          tabSize: 2,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-600">
                      Headers
                    </label>
                    <button
                      onClick={addHeader}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-md transition-colors"
                      style={{ backgroundColor: '#e75e27' }}
                      title="Add Header"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => updateHeader(index, 'key', e.target.value)}
                          placeholder="Key (e.g., Authorization)"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 bg-white"
                        />
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => updateHeader(index, 'value', e.target.value)}
                          placeholder="Value (e.g., Bearer token)"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 bg-white"
                        />
                        <button
                          onClick={() => removeHeader(index)}
                          disabled={headers.length === 1}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          title="Delete Header"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleSyncResponse}
                    disabled={isSyncing}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isSyncing ? '#f9fafb' : 'rgba(231, 94, 39, 0.08)',
                      borderColor: isSyncing ? '#d1d5db' : 'rgba(231, 94, 39, 0.3)',
                      color: isSyncing ? '#6b7280' : '#e75e27',
                    }}
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Response'}
                  </button>

                  {syncStatus && (
                    <div
                      className={`w-full sm:w-auto px-3 py-2 rounded-md text-xs border ${
                        syncStatus.type === 'success'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {syncStatus.text}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 block">
                    Latest Response
                  </label>
                  <div className="border border-slate-200 rounded-lg bg-slate-50 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words p-3 font-mono">
                      {responseJson || 'No response synced yet.'}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-900">Map Response to Variables</h4>
                
                <div className="space-y-3 pr-2">
                  {variables.map((variable, index) => {
                    if (variable.type === 'array' && Array.isArray(variable.value) && variable.value.length > 0) {
                      const firstItem = variable.value[0];
                      const fields = Object.keys(firstItem);
                      
                      return (
                        <div key={index} className="border border-slate-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2 flex-1">
                              <label className="text-xs font-medium text-slate-600">Variable Name:</label>
                              <input
                                type="text"
                                value={variableNames[index] || ''}
                                onChange={(e) => {
                                  const newName = e.target.value;
                                  const oldVarName = variableNames[index] || '';
                                  
                                  // Update variable name in state (even if empty)
                                  setVariableNames(prev => ({ ...prev, [index]: newName }));
                                  
                                  // Only update field mapping keys if both old and new names exist
                                  // If clearing (newName is empty), leave field mappings unchanged
                                  if (oldVarName && newName) {
                                    const oldFields = Object.keys(firstItem);
                                    const updatedMappings = { ...fieldMappings };
                                    
                                    oldFields.forEach((fieldName) => {
                                      const oldKey = `${oldVarName}.${fieldName}`;
                                      const newKey = `${newName}.${fieldName}`;
                                      if (updatedMappings[oldKey]) {
                                        updatedMappings[newKey] = updatedMappings[oldKey];
                                        delete updatedMappings[oldKey];
                                      }
                                    });
                                    
                                    setFieldMappings(updatedMappings);
                                  }
                                }}
                                placeholder="e.g., offers, items, data"
                                className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm font-semibold text-slate-900 bg-slate-50"
                              />
                            </div>
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              array
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600 mb-1 block">
                              Field Mappings
                            </label>
                            {fields.map((fieldName, fieldIdx) => {
                              const currentVarName = variableNames[index] || '';
                              const fieldKey = currentVarName ? `${currentVarName}.${fieldName}` : fieldName;
                              return (
                                <div key={fieldIdx} className="space-y-1 relative">
                                  <label className="text-xs font-medium text-slate-500">
                                    {fieldName}
                                  </label>
                                  <input
                                    type="text"
                                    value={fieldMappings[fieldKey] || ''}
                                    placeholder={`e.g., {{response.items.${fieldName}}}`}
                                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900 bg-slate-50 font-mono"
                                    onChange={(e) => handleMappingInputChange(fieldKey, e.target.value, e.target)}
                                    onKeyDown={(e) => {
                                      if (showSuggestions && selectedMappingField === fieldKey) {
                                        const suggestions = getFilteredSuggestions();
                                        if (e.key === 'ArrowDown') {
                                          e.preventDefault();
                                          setActiveSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                                        } else if (e.key === 'ArrowUp') {
                                          e.preventDefault();
                                          setActiveSuggestionIndex(prev => Math.max(prev - 1, 0));
                                        } else if (e.key === 'Enter' && suggestions.length > 0) {
                                          e.preventDefault();
                                          insertSuggestion(suggestions[activeSuggestionIndex], e.currentTarget);
                                        } else if (e.key === 'Escape') {
                                          setShowSuggestions(false);
                                        }
                                      }
                                    }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                  />
                                  {showSuggestions && selectedMappingField === fieldKey && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                      {getFilteredSuggestions().map((path, idx) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-blue-50 text-slate-900 ${
                                            idx === activeSuggestionIndex ? 'bg-blue-100' : ''
                                          }`}
                                          onClick={(e) => {
                                            const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                                            if (input) insertSuggestion(path, input);
                                          }}
                                        >
                                          {path}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    } else {
                      const fieldKey = variable.name;
                      return (
                        <div key={index} className="bg-slate-50 p-3 rounded-lg relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-700">{variable.name}</span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {variable.type}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={fieldMappings[fieldKey] || ''}
                              placeholder={`e.g., {{response.${variable.name}}}`}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-900 bg-white font-mono"
                              onChange={(e) => handleMappingInputChange(fieldKey, e.target.value, e.target)}
                              onKeyDown={(e) => {
                                if (showSuggestions && selectedMappingField === fieldKey) {
                                  const suggestions = getFilteredSuggestions();
                                  if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setActiveSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setActiveSuggestionIndex(prev => Math.max(prev - 1, 0));
                                  } else if (e.key === 'Enter' && suggestions.length > 0) {
                                    e.preventDefault();
                                    insertSuggestion(suggestions[activeSuggestionIndex], e.currentTarget);
                                  } else if (e.key === 'Escape') {
                                    setShowSuggestions(false);
                                  }
                                }
                              }}
                              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                          </div>
                          {showSuggestions && selectedMappingField === fieldKey && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {getFilteredSuggestions().map((path, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-blue-50 text-slate-900 ${
                                    idx === activeSuggestionIndex ? 'bg-blue-100' : ''
                                  }`}
                                  onClick={(e) => {
                                    const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                                    if (input) insertSuggestion(path, input);
                                  }}
                                >
                                  {path}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 space-y-2">
              {updateMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  updateMessage.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {updateMessage.text}
                </div>
              )}

              <button 
                onClick={dynamicTab === 'settings' ? handleSaveApiSettings : handleSaveMappings}
                disabled={isUpdating}
                className="w-full px-4 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border"
                style={{ 
                  backgroundColor: isUpdating ? '#f9fafb' : 'rgba(231, 94, 39, 0.08)',
                  borderColor: isUpdating ? '#d1d5db' : 'rgba(231, 94, 39, 0.3)',
                  color: isUpdating ? '#6b7280' : '#e75e27'
                }}
              >
                {isUpdating ? 'Saving...' : (dynamicTab === 'settings' ? 'Save API Settings' : 'Save Mappings')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}