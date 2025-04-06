SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    column_default,
    is_nullable,
    udt_name,
    table_name
FROM 
    information_schema.columns 
WHERE 
    table_name = 'users'
ORDER BY 
    ordinal_position;
