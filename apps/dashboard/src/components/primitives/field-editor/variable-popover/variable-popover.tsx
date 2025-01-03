import { FormControl, FormItem } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { PopoverContent } from '@/components/primitives/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { Switch } from '@/components/primitives/switch';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Code2 } from '../../../icons/code-2';
import { Separator } from '../../separator';
import { TransformerItem } from './components/transformer-item';
import { TransformerList } from './components/transformer-list';
import { useTransformerManager } from './hooks/use-transformer-manager';
import { useVariableParser } from './hooks/use-variable-parser';
import type { VariablePopoverProps } from './types';
import { formatLiquidVariable } from './utils';

function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export function VariablePopover({ variable, onClose, onUpdate }: VariablePopoverProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { parsedName, parsedDefaultValue, parsedTransformers, originalVariable } = useVariableParser(variable || '');
  const [name, setName] = useState(parsedName);
  const [defaultVal, setDefaultVal] = useState(parsedDefaultValue);
  const [showRawLiquid, setShowRawLiquid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const updateVariable = useCallback(
    (newName: string, newDefaultVal: string, newTransformers: any[]) => {
      onUpdate(formatLiquidVariable(newName, newDefaultVal, newTransformers));
    },
    [onUpdate]
  );

  const debouncedUpdate = useDebounce(updateVariable, 300);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const {
    transformers,
    dragOverIndex,
    draggingItem,
    setDragOverIndex,
    setDraggingItem,
    handleTransformerToggle,
    moveTransformer,
    handleParamChange,
    getFilteredTransformers,
  } = useTransformerManager({
    initialTransformers: parsedTransformers,
    onUpdate: (newTransformers) => {
      debouncedUpdate(name, defaultVal, newTransformers);
    },
  });

  const handleNameChange = useCallback(
    (newName: string) => {
      setName(newName);
      debouncedUpdate(newName, defaultVal, transformers);
    },
    [defaultVal, transformers, debouncedUpdate]
  );

  const handleDefaultValueChange = useCallback(
    (newDefaultVal: string) => {
      setDefaultVal(newDefaultVal);
      debouncedUpdate(name, newDefaultVal, transformers);
    },
    [name, transformers, debouncedUpdate]
  );

  const handleRawLiquidChange = useCallback((value: string) => {
    // Remove {{ and }} and trim
    const content = value.replace(/^\{\{\s*|\s*\}\}$/g, '').trim();

    // Split by pipe and trim each part
    const parts = content.split('|').map((part) => part.trim());

    // First part is the name
    const newName = parts[0];
    setName(newName);

    // Process each part after the name
    parts.slice(1).forEach((part) => {
      if (part.startsWith('default:')) {
        // Extract default value, handling quotes
        const newDefaultVal = part
          .replace('default:', '')
          .trim()
          .replace(/^["']|["']$/g, '');
        setDefaultVal(newDefaultVal);
      }
    });
  }, []);

  const filteredTransformers = useMemo(
    () => getFilteredTransformers(searchQuery),
    [getFilteredTransformers, searchQuery]
  );

  const currentLiquidValue = useMemo(
    () => originalVariable || formatLiquidVariable(name, defaultVal, transformers),
    [originalVariable, name, defaultVal, transformers]
  );

  return (
    <PopoverContent className="w-72 p-0 pb-1">
      <div>
        <div className="bg-bg-weak">
          <div className="flex flex-row items-center justify-between space-y-0 p-1.5">
            <div className="flex items-center gap-1">
              <span className="font-subheading-2x-small text-subheading-2xs text-text-soft">CONFIGURE VARIABLE</span>
            </div>
          </div>
        </div>
        <div className="grid gap-1.5">
          <div className="grid gap-2 p-2">
            <FormItem>
              <FormControl>
                <div className="grid gap-1">
                  <label className="text-text-sub text-label-xs">Variable name</label>
                  <InputField size="fit" className="min-h-0">
                    <Code2 className="text-text-sub h-4 w-4 min-w-4" />
                    <Input value={name} onChange={(e) => handleNameChange(e.target.value)} className="h-7 text-sm" />
                  </InputField>
                </div>
              </FormControl>
            </FormItem>

            <FormItem>
              <FormControl>
                <div className="grid gap-1">
                  <label className="text-text-sub text-label-xs">Default value</label>
                  <InputField size="fit" className="min-h-0">
                    <Input
                      value={defaultVal}
                      onChange={(e) => handleDefaultValueChange(e.target.value)}
                      className="h-7 text-sm"
                    />
                  </InputField>
                </div>
              </FormControl>
            </FormItem>
            <FormItem>
              <FormControl>
                <div className="flex items-center justify-between">
                  <label className="text-text-sub text-label-xs">Show raw liquid</label>
                  <Switch checked={showRawLiquid} onCheckedChange={setShowRawLiquid} className="scale-75" />
                </div>
              </FormControl>
            </FormItem>
            {showRawLiquid && (
              <FormItem>
                <FormControl>
                  <div className="grid gap-1">
                    <InputField size="fit" className="min-h-0">
                      <Input
                        value={currentLiquidValue}
                        onChange={(e) => handleRawLiquidChange(e.target.value)}
                        className="h-7 text-sm"
                      />
                    </InputField>
                  </div>
                </FormControl>
              </FormItem>
            )}
          </div>

          <Separator className="my-0" />

          <div className="flex flex-col gap-1 p-2">
            <FormItem>
              <FormControl>
                <div className="grid gap-1">
                  <label className="text-text-sub text-label-xs">Modifiers</label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value) {
                        handleTransformerToggle(value);
                        setSearchQuery('');
                      }
                    }}
                  >
                    <SelectTrigger className="!text-paragraph-xs text-text-soft !h-[30px] min-h-7">
                      <SelectValue placeholder="Add a modifier..." />
                    </SelectTrigger>
                    <SelectContent
                      onCloseAutoFocus={(e) => {
                        e.preventDefault();
                        searchInputRef.current?.focus();
                      }}
                      className="max-h-[400px] w-[340px]"
                      align="start"
                    >
                      <div className="p-2">
                        <InputField size="fit" className="min-h-0">
                          <Input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSearchQuery(e.target.value);
                            }}
                            className="h-7 text-sm"
                            placeholder="Search modifiers..."
                            autoFocus
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Escape') {
                                setSearchQuery('');
                              }
                            }}
                          />
                        </InputField>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto px-1">
                        {filteredTransformers.length === 0 ? (
                          <div className="text-text-soft flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <span className="text-sm">
                              {searchQuery ? 'No modifiers found' : 'All modifiers have been added'}
                            </span>
                            {searchQuery && <span className="text-xs">Try searching for different terms</span>}
                          </div>
                        ) : (
                          filteredTransformers.map((transformer) => (
                            <SelectItem
                              key={transformer.value}
                              value={transformer.value}
                              className="relative [&>*:first-child]:p-0"
                            >
                              <TransformerItem transformer={transformer} />
                            </SelectItem>
                          ))
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
            </FormItem>

            <TransformerList
              transformers={transformers}
              dragOverIndex={dragOverIndex}
              draggingItem={draggingItem}
              onDragStart={setDraggingItem}
              onDragEnd={() => {
                if (dragOverIndex !== null && draggingItem !== null && draggingItem !== dragOverIndex) {
                  moveTransformer(draggingItem, dragOverIndex);
                }
                setDraggingItem(null);
                setDragOverIndex(null);
              }}
              onDrag={(_, info) => {
                const elements = document.elementsFromPoint(info.point.x, info.point.y);
                const droppableElement = elements.find(
                  (el) => el.classList.contains('group') && !el.classList.contains('opacity-50')
                );

                if (droppableElement) {
                  const index = parseInt(droppableElement.getAttribute('data-index') || '-1');
                  if (index !== -1 && dragOverIndex !== index) {
                    setDragOverIndex(index);
                  }
                } else {
                  setDragOverIndex(null);
                }
              }}
              onRemove={handleTransformerToggle}
              onParamChange={handleParamChange}
            />
          </div>
        </div>
      </div>
    </PopoverContent>
  );
}
