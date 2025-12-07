import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { Dispatch, SetStateAction } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FormControl } from "./ui/form";

type Props = {
    setOpen: Dispatch<SetStateAction<boolean>>;
    open: boolean;
    options: { id: string; name: string }[]
    value: string;
    onChange: (...event: any[]) => void
    placeholder?: string;
    disabled?: boolean
}

const Combobox = ({ options, open, setOpen, value, onChange, placeholder, disabled }: Props) => {
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="form-input flex items-center justify-between"
                >
                    {value
                        ? options.find((option) => option.id === value)?.name
                        : placeholder}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[90%] p-0 mx-auto">
                <FormControl>
                    <Command>
                        <CommandInput placeholder={"Search ..."} className="h-9" />
                        <CommandList>
                            <CommandEmpty>Empty</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.id}
                                        value={option.id}
                                        keywords={[option.name]}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue)
                                            setOpen(false)
                                        }}
                                    >
                                        {option.name}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value === option.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </FormControl>
            </PopoverContent>
        </Popover>
    )
}

export default React.memo(Combobox)