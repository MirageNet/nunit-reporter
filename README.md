# nunit reporter

Create an annotation of the build information and also list first n failed nunit tests

Example

```yaml
  - uses: MirageNet/nunit-reporter@v1.0.9
      if: always()
      with:
        path: Tests/*.xml
        access-token: ${{ secrets.GITHUB_TOKEN }}
```

See https://github.com/MirageNet/nunit-reporter/pull/2/files for an example.
