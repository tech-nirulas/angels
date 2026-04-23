import { Autocomplete, Box, Checkbox, Chip, FormControl, FormHelperText, InputLabel, ListItemText, MenuItem, OutlinedInput, OutlinedInputProps, SelectProps, TextField } from "@mui/material";
import { useField } from "formik";
import { useEffect, useRef, useState } from "react";

interface MaterialTextFieldProps extends React.ComponentProps<typeof TextField> {
  label: string;
}

export const MaterialTextField = ({ label, ...props }: MaterialTextFieldProps) => {
  const [field, meta] = useField(props.name || '');
  const errorText = meta.touched && meta.error ? meta.error : '';

  // ✅ Prevent null/undefined values
  const fieldValue = field.value === null || field.value === undefined ? '' : field.value;

  return (
    <TextField
      {...field}
      {...props}
      value={fieldValue}
      label={label}
      variant="outlined"
      fullWidth
      error={!!errorText}
      helperText={errorText}
    />
  );
};

interface MaterialPasswordFieldProps extends Omit<OutlinedInputProps, 'endAdornment'> {
  label: string;
  endAdornment?: React.ReactNode;
}

export const MaterialPasswordField = ({ label, ...props }: MaterialPasswordFieldProps) => {
  const [field, meta] = useField(props.name || '');
  const errorText = meta.touched && meta.error ? meta.error : '';

  return (
    <FormControl fullWidth variant="outlined" error={!!errorText} sx={{ marginBottom: 2 }}>
      <InputLabel htmlFor={props.id || props.name}>{label}</InputLabel>
      <OutlinedInput
        {...field}
        {...props}
        label={label}
        sx={{ marginBottom: errorText ? 0 : 2 }}
        endAdornment={props.endAdornment ? props.endAdornment : null}
        error={!!errorText}
      />
      {errorText && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
};

interface OptionType {
  value: string | number | boolean | undefined;
  label: string | undefined;
}

interface MaterialSelectFieldProps extends Omit<SelectProps, "multiple"> {
  label: string;
  options: OptionType[] | null;
}

export const MaterialSelectField = ({ label, options, ...props }: MaterialSelectFieldProps) => {
  const [field, meta, helpers] = useField(props.name || "");
  const errorText = meta.touched && meta.error ? meta.error : "";
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize the internal inputValue with the Formik field value
  useEffect(() => {
    if (!field.value) {
      setInputValue('');
    } else {
      // Optional: if you want to display the label corresponding to the value
      const selectedOption = options?.find(option => option.value === field.value);
      if (selectedOption) {
        setInputValue(selectedOption.label || '');
      }
    }
  }, [field.value, options]);

  const validateValue = () => {
    const currentInput = inputRef.current?.value || "";
    helpers.setError("");
    if (currentInput.trim() === "") {
      helpers.setValue("");
      return;
    }
    const exactMatch = options?.find(option =>
      option.label?.toLowerCase() === currentInput.toLowerCase()
    );
    if (exactMatch) {
      helpers.setValue(exactMatch.value);
      return;
    }
    const partialMatch = options?.find(option =>
      option.label?.toLowerCase().startsWith(currentInput.toLowerCase())
    );
    if (partialMatch) {
      helpers.setValue(partialMatch.value);
      setInputValue(partialMatch.label || "");
    } else {
      helpers.setError("No matching option found");
      helpers.setValue("");
      setInputValue("");
    }
  };

  return (
    <FormControl fullWidth variant="outlined" error={!!errorText}>
      <Autocomplete
        id={props.name}
        options={options || []}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label || ""
        }
        isOptionEqualToValue={(option, value) =>
          typeof option === "string"
            ? option === value
            : option.value === (typeof value === "string" ? value : value?.value)
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            error={!!errorText}
            helperText={errorText}
            inputRef={inputRef}
          />
        )}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(_, newValue) => {
          if (typeof newValue === "string") {
            helpers.setValue(newValue);
          } else {
            helpers.setValue(newValue ? newValue.value : "");
          }
          // Clear the input when a new value is selected
          setInputValue("");
        }}
        onBlur={validateValue}
        value={options?.find(option => option.value === field.value) || null}
        autoHighlight
        freeSolo
        filterOptions={(options, state) => {
          const inputVal = state.inputValue.toLowerCase();
          return options.filter(option =>
            option.label?.toLowerCase().includes(inputVal)
          );
        }}
      />
    </FormControl>
  );
};

interface MaterialMultiSelectFieldProps
  extends Omit<SelectProps<any>, "multiple"> {
  label: string;
  options: OptionType[] | null;
  // onCreate should return the created OptionType
  onCreate?: (input: string) => Promise<OptionType>;
  refetchOptions?: () => Promise<void>;
}

export const MaterialMultiSelectField = ({
  label,
  options,
  onCreate,
  refetchOptions,
  ...props
}: MaterialMultiSelectFieldProps) => {
  const [field, meta, helpers] = useField(props.name || "");
  const errorText = meta.touched && meta.error ? meta.error : "";
  const [inputValue, setInputValue] = useState("");
  const selectedValues = Array.isArray(field.value) ? field.value : [];
  const allOptions = options || [];

  const handleOptionChange = (
    event: React.SyntheticEvent,
    value: (string | OptionType)[],
    reason: any
  ) => {
    const newValues = value.map((option) =>
      typeof option === "string" ? option : option.value
    );
    helpers.setValue(newValues);
  };

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setInputValue(value);
  };

  const handleBlur = async () => {
    if (inputValue.trim()) {
      // Check for an existing option (case-insensitive)
      const trimmedInput = inputValue.trim();
      const matchedOption = allOptions.find(
        (option) =>
          option.label?.toLowerCase() === trimmedInput.toLowerCase()
      );

      if (matchedOption) {
        // Add the option if it isn't already selected.
        if (!selectedValues.includes(matchedOption.value)) {
          helpers.setValue([...selectedValues, matchedOption.value]);
        }
      } else if (onCreate) {
        // Create the new option
        try {
          const createdOption = await onCreate(trimmedInput);
          // Immediately add the created option to the selection.
          if (!selectedValues.includes(createdOption.value)) {
            helpers.setValue([...selectedValues, createdOption.value]);
          }
          // Optionally refetch the options list.
          if (refetchOptions) {
            await refetchOptions();
            // After refetching, try to locate the newly created option in the updated list.
            const updatedOption = options?.find(
              (option) =>
                option.label?.toLowerCase() === trimmedInput.toLowerCase()
            );
            if (updatedOption && !selectedValues.includes(updatedOption.value)) {
              helpers.setValue([...selectedValues, updatedOption.value]);
            }
          }
        } catch (error) {
          console.error("Creation failed:", error);
          // Optionally, add error handling (e.g., show an error message)
        }
      }
      setInputValue("");
    }
  };

  return (
    <FormControl fullWidth variant="outlined" error={!!errorText}>
      <Autocomplete
        multiple
        freeSolo
        id={props.name}
        options={allOptions}
        value={allOptions.filter((option) =>
          selectedValues.includes(option.value)
        )}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label || ""
        }
        onChange={handleOptionChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onBlur={handleBlur}
        disableCloseOnSelect
        filterOptions={(options, state) => {
          const input = state.inputValue.toLowerCase();
          return options.filter((option) =>
            option.label?.toLowerCase().includes(input)
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            variant="outlined"
            error={!!errorText}
            helperText={errorText}
          />
        )}
        renderOption={(optionProps, option) => (
          <MenuItem {...optionProps} key={String(option.value)}>
            <Checkbox checked={selectedValues.includes(option.value)} />
            <ListItemText primary={option.label} />
          </MenuItem>
        )}
        isOptionEqualToValue={(option, value) =>
          option.value === value.value
        }
      />
      {errorText && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
};


interface MaterialFreeInputMultiSelectProps extends Omit<OutlinedInputProps, 'onChange'> {
  label: string;
}

export const MaterialFreeInputMultiSelect = ({
  label,
  ...props
}: MaterialFreeInputMultiSelectProps) => {
  const [field, meta, helpers] = useField<string[]>(props.name || "");
  const [inputValue, setInputValue] = useState("");
  const errorText = meta.touched && meta.error ? meta.error : "";

  const selectedValues = Array.isArray(field.value) ? field.value : [];

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === "Tab") && inputValue.trim()) {
      event.preventDefault();
      if (!selectedValues.includes(inputValue.trim())) {
        helpers.setValue([...selectedValues, inputValue.trim()]);
      }
      setInputValue("");
    } else if (event.key === "Backspace" && !inputValue.trim() && selectedValues.length > 0) {
      helpers.setValue(selectedValues.slice(0, -1));
    }
  };

  const handleDelete = (value: string) => () => {
    helpers.setValue(selectedValues.filter(item => item !== value));
  };

  return (
    <FormControl fullWidth variant="outlined" error={!!errorText}>
      <InputLabel htmlFor={props.name}>{label}</InputLabel>
      <OutlinedInput
        {...props}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        label={label}
        startAdornment={
          <Box display="flex" gap={0.5} py={1}>
            {selectedValues.map((value) => (
              <Chip
                key={value}
                label={value}
                onDelete={handleDelete(value)}
                style={{ margin: 2 }}
              />
            ))}
          </Box>
        }
      />
      {errorText && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
};
