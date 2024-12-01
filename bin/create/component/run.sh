#!/bin/bash

# region SETUP
############### START ###############
# clean up tmp & create it 
rm "$SCRIPTDIR/component/.tmp" &> /dev/null
touch "$SCRIPTDIR/component/.tmp"

cleanup_run=false
cleanup() {
  if [ $cleanup_run == false ]; then 
    cleanup_run=true 
    rm "$SCRIPTDIR/component/.tmp" &> /dev/null

    if [ $INITIAL_PACKAGE == false ]; then 
      echo "cleanup - generate:component"
    fi 
  fi 
  exit
}

trap cleanup INT
trap cleanup EXIT
############### END #################
#endregion SETUP

#region VARIABLES
############### START ###############
export PACKAGE_LOCATION="$1"
export QUICK=false
export INITIAL_PACKAGE=false

# check for flags 
for arg in "$@"; do
  # check: --prod flag
  if [[ $arg == "--quick" ]]; then
    export QUICK=true
  elif [[ $arg == "--package" ]]; then
    export INITIAL_PACKAGE=true
  elif [[ $arg == --type=* ]]; then 
    export COMPONENT_TYPE="${arg#*=}"
  elif [[ $arg == --location=* ]]; then 
    export PACKAGE_LOCATION="${arg#*=}"
  fi 
done

# lets start by defining our variables 
if [ -f "$ROOTDIR/.config" ]; then
  source "$ROOTDIR/.config" 
else 
  GLOBAL_PREFIX=$PROJECTSCOPE
fi 
if [ -f "$PACKAGE_LOCATION/.config" ]; then 
  source "$PACKAGE_LOCATION/.config"
  export FULL_PACKAGE_NAME=$FULL_NAME
else 
  echo "[error] could not find package config: [$PACKAGE_LOCATION/.config]"
  exit 1
fi 
if [ -n "$LAYER_FOLDER" ]; then 
  if [ -f "$ROOTDIR/packages/$LAYER_FOLDER/.config" ]; then 
    source "$ROOTDIR/packages/$LAYER_FOLDER/.config"
  else 
    echo "[error] could not find layer config: [$ROOTDIR/packages/$LAYER_FOLDER/.config]"
    exit 1
  fi

  export LAYER_NAME=$LAYER_NAME
  export LAYER_INCLUDE=$LAYER_INCLUDE
fi

# check if this is first package (called from generate:package script)
if [ $INITIAL_PACKAGE == true ]; then 
  export COMPONENT_NAME=$NAME
  export COMPONENT_CLASS_NAME=$CLASS_NAME
  export COMPONENT_PACKAGE_NAME=$PACKAGE_NAME
else 
  if [ ! -d "$PACKAGE_LOCATION/src/components" ]; then 
    mkdir "$PACKAGE_LOCATION/src/components"
  fi 
fi

if [ -n "$LAYER_FOLDER" ]; then 
  # we need to source layer config
  if [ -f "$ROOTDIR/packages/$LAYER_FOLDER/.config" ]; then 
    source "$ROOTDIR/packages/$LAYER_FOLDER/.config"
  else 
    echo "[error] could not determine layer config file at: [$ROOTDIR/packages/$LAYER_FOLDER/.config]"
    exit 1
  fi
fi
############### END #################
#endregion VARIABLES

# region PREFIX
############### START ###############
COMPONENT_PREFIX=
if [ -n "$GLOBAL_PREFIX" ]; then 
  echo "" 
  echo "global-prefix is set to: $GLOBAL_PREFIX"
  echo "use global-prefix [1 or empty] or provide a custom prefix"
  read -p "component prefix [1/0/custom]: " USE_GLOBAL_PREFIX

  if [ "$USE_GLOBAL_PREFIX" == "0" ]; then 
    echo "global-prefix will not be used"
    COMPONENT_PREFIX=""
  elif [[ "$USE_GLOBAL_PREFIX" == "" || "$USE_GLOBAL_PREFIX" == "1" ]]; then 
    COMPONENT_PREFIX="$GLOBAL_PREFIX-"
  else 
    echo "you choose custom: $USE_GLOBAL_PREFIX"
    COMPONENT_PREFIX="$USE_GLOBAL_PREFIX-"
  fi 
fi 
############### END #################
#endregion PREFIX

bash "$SCRIPTDIR/component/scripts/name.sh"
bash "$SCRIPTDIR/component/scripts/type.sh"

source "$SCRIPTDIR/component/.tmp"
COMPONENT_HTML_NAME=""
if [ -d "$ROOTDIR/bin/create/component/template/$COMPONENT_TYPE/views" ]; then 
  COMPONENT_HTML_NAME="$COMPONENT_PREFIX$COMPONENT_FULL_NAME"
fi 
echo "COMPONENT_HTML_NAME=$COMPONENT_HTML_NAME" >> "$SCRIPTDIR/component/.tmp"

bash "$SCRIPTDIR/component/scripts/copy.sh"

# no unecessary prints..
if [ "$INITIAL_PACKAGE" == false ]; then 
  echo ""
  echo "$COMPONENT_NAME successfully created ✅"
fi 