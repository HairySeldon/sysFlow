# 1. Install root & workspace dependencies
npm install

# 2. Build the @sysflow/core package
npm run build --workspace=@sysflow/core

# 3. Launch the reference applications
npm run dev --workspace=@sysflow/demo
