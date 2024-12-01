package dev.doublekekse.datamonster;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class Table<T> {
    public String name;
    public List<T> dataRows = new ArrayList<>();
    public Map<String, Function<T, String>> columnFunctions = new HashMap<>();

    public Table(String name) {
        this.name = name;
    }

    public void addColumn(String name, Function<T, String> data) {
        this.columnFunctions.put(name, data);
    }

    public void addDataRow(T data) {
        this.dataRows.add(data);
    }

    public void export() throws IOException {
        var sb = new StringBuilder();

        sb.append(String.join(",", columnFunctions.keySet()));
        sb.append("\n");

        for (var dataRow : dataRows) {
            var values = columnFunctions.values().stream().map((function) -> "\"" + function.apply(dataRow).replaceAll("\"", "\"\"") + "\"");

            sb.append(values.collect(Collectors.joining(",")));
            sb.append("\n");
        }

        var file = new File(name.toLowerCase() + ".csv");
        Files.writeString(file.toPath(), sb.toString());
    }
}
