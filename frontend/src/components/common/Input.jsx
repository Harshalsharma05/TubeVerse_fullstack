// src/components/common/Input.jsx
const Input = ({ label, type = "text", name, value, onChange, error, accept, ...props }) => {
    if (type === "file") {
        return (
            <div className="w-full">
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                </label>
            )}
            <input
                type="file"
                name={name}
                id={name}
                onChange={onChange}
                accept={accept}
                className={`block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                ${error ? 'text-red-500' : ''}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
        }
    
        return (
        <div className="w-full">
            {label && (
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            )}
            <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
        );
};

export default Input;