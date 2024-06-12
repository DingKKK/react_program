#include<stdlib.h>
#include<stdio.h>
int main(){
int *p =(int*)malloc(sizeof(int)*10);int *q=(int*)malloc(sizeof(int)*10);int i ;scanf("%d",&i);
if(i){
free(p);
}else {
free(q);
}
return 0;
}
